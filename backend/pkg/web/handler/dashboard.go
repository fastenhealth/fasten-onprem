package handler

import (
	"context"
	"embed"
	"encoding/json"
	"fmt"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/database"
	"github.com/gin-gonic/gin"
	"github.com/google/go-github/v54/github"
	"github.com/sirupsen/logrus"
	"golang.org/x/exp/slices"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

//go:embed dashboard/*.json
var dashboardFS embed.FS

func GetDashboard(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	//appConfig := c.MustGet(pkg.ContextKeyTypeConfig).(config.Interface)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	var dirEntries []fs.DirEntry
	var err error

	//load settings from dashboard
	logger.Infof("Loading User Settings..")
	userSettings, err := databaseRepo.LoadUserSettings(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	logger.Debugf("User Settings: %v", userSettings)

	//get current user
	currentUser, err := databaseRepo.GetCurrentUser(c)
	if err != nil {
		logger.Errorf("Error getting current user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	var dashboards []map[string]interface{}

	if userSettings.DashboardLocations != nil && len(userSettings.DashboardLocations) > 0 {
		logger.Infof("Loading dashboard(s) from %v", userSettings.DashboardLocations)

		// initialize the cache directory
		cacheDir, err := getCacheDir(currentUser.ID.String())
		if err != nil {
			logger.Errorf("Error creating cache directory: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
			return
		}

		dirEntries, err = os.ReadDir(cacheDir)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
			return
		}

		dashboards, err = getDashboardFromDir(dirEntries, os.ReadFile)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
			return
		}
	} else {
		dirEntries, err = dashboardFS.ReadDir("dashboard")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
			return
		}

		dashboards, err = getDashboardFromDir(dirEntries, dashboardFS.ReadFile)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": dashboards})
}

func SaveDashboardLocations(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	//appConfig := c.MustGet(pkg.ContextKeyTypeConfig).(config.Interface)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	//load settings from database
	logger.Infof("Loading User Settings..")
	userSettings, err := databaseRepo.LoadUserSettings(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	//override locations with new locations
	userSettings.DashboardLocations = c.PostFormArray("dashboardLocations")

	logger.Debugf("User Settings: %v", userSettings)

	//get current user
	currentUser, err := databaseRepo.GetCurrentUser(c)
	if err != nil {
		logger.Errorf("Error getting current user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	cacheDir, err := getCacheDir(currentUser.ID.String())
	if err != nil {
		logger.Errorf("Error creating cache directory: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	// initialize the github client (Anonymous access)
	githubClient := github.NewClient(nil)

	cacheErrors := map[string]error{}
	cacheDashboards := []string{}
	for _, remoteDashboardLocation := range userSettings.DashboardLocations {
		cacheDashboardLocation, err := cacheCustomDashboard(logger, githubClient, cacheDir, remoteDashboardLocation)
		if err != nil {
			cacheErrors[remoteDashboardLocation] = err
		}
		cacheDashboards = append(cacheDashboards, filepath.Base(cacheDashboardLocation))
	}

	//cleanup any files in the cache that are no longer in the dashboard locations
	dirEntries, err := os.ReadDir(cacheDir)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	for _, dirEntry := range dirEntries {
		if !slices.Contains(cacheDashboards, dirEntry.Name()) {
			logger.Debugf("Removing %v from cache", dirEntry.Name())
			err = os.RemoveAll(filepath.Join(cacheDir, dirEntry.Name()))
			if err != nil {
				logger.Errorf("Error removing %v from cache: %v", dirEntry.Name(), err)
			}
		}
	}

	if len(cacheErrors) > 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": cacheErrors})
		return
	} else {
		err = databaseRepo.SaveUserSettings(c, userSettings)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true})
	}

}

//private functions
func getCacheDir(currentUserId string) (string, error) {
	// initialize the cache directory
	cacheDir := filepath.Join("cache", currentUserId, "dashboard")
	err := os.MkdirAll(cacheDir, 0755)
	if err != nil {
		return "", fmt.Errorf("error creating cache directory: %v", err)
	}
	return cacheDir, nil
}

func cacheCustomDashboard(logger *logrus.Entry, githubClient *github.Client, cacheDir string, remoteDashboardLocation string) (string, error) {
	//- validate that the url is to a github gist, no other locations are supported
	//- download the gist metadata
	//- if more than 1 file found, look for a dashboard.json
	//- check if the file sha exists on the file system  (content-addressible file system)
	//- if its not present, download it
	//- if its not json, throw an error
	//- if it doesnt match the dashboard config schema, throw an error.

	if !strings.HasPrefix(remoteDashboardLocation, "https://gist.github.com") {
		return "", fmt.Errorf("remote dashboard location is not a github gist: %v", remoteDashboardLocation)
	}

	logger.Infof("Processing custom dashboard from %v", remoteDashboardLocation)

	gist, _, err := githubClient.Gists.Get(context.Background(), remoteDashboardLocation)
	if err != nil {
		return "", fmt.Errorf("error retrieving remote gist: %v", err)
	}

	//check if gist has more than 1 file
	var dashboardJsonFile github.GistFile
	if len(gist.Files) == 0 {
		return "", fmt.Errorf("gist has no files: %v", remoteDashboardLocation)
	}
	if len(gist.Files) > 1 {
		//find the dashboard.json file
		if gistFile, ok := gist.Files["dashboard.json"]; ok {
			dashboardJsonFile = gistFile
		} else {
			return "", fmt.Errorf("dashboard location gist has more than 1 file and no dashboard.json: %v", remoteDashboardLocation)
		}
	} else {
		//only 1 file, use it
		for _, gistFile := range gist.Files {
			dashboardJsonFile = gistFile

			if contentType := gistFile.GetType(); contentType != "application/json" {
				logger.Warnf("ContentType is not detected as JSON: %v", remoteDashboardLocation)
			}
		}
	}

	//ensure that the file is valid json
	var dashboardJson map[string]interface{}
	err = json.Unmarshal([]byte(dashboardJsonFile.GetContent()), &dashboardJson)
	if err != nil {
		return "", fmt.Errorf("error unmarshalling dashboard configuration (invalid JSON?): %v", err)
	}

	//TODO: validate against DashboardConfigSchema

	absCacheFileLocation := filepath.Join(cacheDir, gist.GetID())
	//write it to filesystem
	logger.Infof("Writing new dashboard configuration to filesystem: %v", remoteDashboardLocation)

	//write file to cache
	err = os.WriteFile(absCacheFileLocation, []byte(dashboardJsonFile.GetContent()), 0644)
	if err != nil {
		return "", fmt.Errorf("error writing dashboard configuration to cache: %v", err)
	}

	return absCacheFileLocation, nil
}

func getDashboardFromDir(dirEntries []fs.DirEntry, fsReadFile func(name string) ([]byte, error)) ([]map[string]interface{}, error) {
	dashboards := []map[string]interface{}{}

	for _, file := range dirEntries {
		if file.IsDir() {
			continue
		}

		//unmarshal file into map
		embeddedFile, err := fsReadFile("dashboard/" + file.Name())
		if err != nil {
			return nil, err
		}

		var dashboardJson map[string]interface{}
		err = json.Unmarshal(embeddedFile, &dashboardJson)
		if err != nil {
			return nil, err
		}

		dashboards = append(dashboards, dashboardJson)
	}
	return dashboards, nil
}
