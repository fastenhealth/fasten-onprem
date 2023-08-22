package handler

import (
	"embed"
	"encoding/json"
	"fmt"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
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
	appConfig := c.MustGet(pkg.ContextKeyTypeConfig).(config.Interface)

	var dirEntries []fs.DirEntry
	var err error

	var dashboards []map[string]interface{}

	if dashboardLocations := appConfig.GetStringSlice("dashboard.location"); dashboardLocations != nil && len(dashboardLocations) > 0 {
		logger.Infof("Loading dashboard(s) from %v", dashboardLocations)

		// TODO: these should be populated from the user settings table (each user can have their own dashboards).
		// TODO: when enabled, used the following algorithm:
		//- validate that the url is to a github gist, no other locations are supported
		//- download the gist metadata
		//- if more than 1 file found, look for a dashboard.json
		//- check if the file sha exists on the file system  (content-addressible file system)
		//- if it doesnt,

		for _, dashboardLocation := range dashboardLocations {
			if strings.HasPrefix(dashboardLocation, "http") {
				c.JSON(http.StatusOK, gin.H{"success": false, "error": fmt.Sprintf("Remote Dashboard URL's are not supported yet: %v", dashboardLocations)})
				return
			}

			//when using `dashboard.locations` config key, each dashboard should be specified individually
			//e.g. dashboard.locations = ["/opt/fasten/dashboard/test.json", "/opt/fasten/dashboard/test2.json"]
			absDashboardLocation, err := filepath.Abs(dashboardLocation)
			if err != nil {
				c.JSON(http.StatusOK, gin.H{"success": false, "error": fmt.Sprintf("Invalid dashboard location: %v", dashboardLocation)})
				return
			}

			//check if path exists
			if _, err := os.Stat(absDashboardLocation); err != nil {
				//file does not exist
				c.JSON(http.StatusOK, gin.H{"success": false, "error": fmt.Sprintf("Dashboard file does not exist: %v", absDashboardLocation)})
				return
			}

			//open file
			file, err := os.ReadFile(absDashboardLocation)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
				return
			}

			//unmarshall json into map
			var dashboardJson map[string]interface{}
			err = json.Unmarshal(file, &dashboardJson)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
				return
			}

			dashboards = append(dashboards, dashboardJson)

		}
	} else {
		dirEntries, err = dashboardFS.ReadDir("dashboard")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
			return
		}

		dashboards, err = getDashboardFromEmbeddedDir(dirEntries)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": dashboards})
}

func getDashboardFromEmbeddedDir(dirEntries []fs.DirEntry) ([]map[string]interface{}, error) {
	dashboards := []map[string]interface{}{}

	for _, file := range dirEntries {
		if file.IsDir() {
			continue
		}

		//unmarshal file into map
		embeddedFile, err := dashboardFS.ReadFile("dashboard/" + file.Name())
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
