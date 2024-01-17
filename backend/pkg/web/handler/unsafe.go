package handler

import (
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/config"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/fastenhealth/fasten-sources/clients/factory"
	sourcePkg "github.com/fastenhealth/fasten-sources/pkg"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"net/http"
	"net/url"
	"strings"
)

/*
These Endpoints are only available when Fasten is deployed with allow_unsafe_endpoints enabled.
*/

func UnsafeRequestSource(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	appConfig := c.MustGet(pkg.ContextKeyTypeConfig).(config.Interface)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	//safety check incase this function is called in another way
	if !appConfig.GetBool("web.allow_unsafe_endpoints") {
		c.JSON(http.StatusServiceUnavailable, gin.H{"success": false})
		return
	}

	//!!!!!!INSECURE!!!!!!S
	//We're setting the username to a user provided value, this is insecure, but required for calling databaseRepo fns
	c.Set("AUTH_USERNAME", c.Param("username"))

	foundSource, err := databaseRepo.GetSource(c, c.Param("sourceId"))
	if err != nil {
		logger.Errorf("An error occurred while finding source credential: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	if foundSource == nil {
		logger.Errorf("Did not source credentials for %s", c.Param("sourceType"))
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": err.Error()})
		return
	}

	client, err := factory.GetSourceClient(sourcePkg.GetFastenLighthouseEnv(), c, logger, foundSource)
	if err != nil {
		logger.Errorf("Could not initialize source client %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	var resp map[string]interface{}

	parsedUrl, err := url.Parse(strings.TrimSuffix(c.Param("path"), "/"))
	if err != nil {
		logger.Errorf("Error parsing request, %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	//make sure we include all query string parameters with the raw request.
	parsedUrl.RawQuery = c.Request.URL.Query().Encode()

	//make sure we store the source credential information in the database, even if the request fails
	defer func() {
		//update source incase the access token/refresh token has been updated
		sourceCredential := client.GetSourceCredential()
		sourceCredentialConcrete, ok := sourceCredential.(*models.SourceCredential)
		if !ok {
			logger.Errorln("An error occurred while updating source credential, source credential is not of type *models.SourceCredential")
			return
		}
		err = databaseRepo.UpdateSource(c, sourceCredentialConcrete)
		if err != nil {
			logger.Errorf("An error occurred while updating source credential: %v", err)
			return
		}
		logger.Info("Successfully updated source credential")
	}()

	_, err = client.GetRequest(parsedUrl.String(), &resp)
	if err != nil {
		logger.Errorf("Error making raw request, %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error(), "data": resp})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": resp})
}

func UnsafeResourceGraph(c *gin.Context) {
	appConfig := c.MustGet(pkg.ContextKeyTypeConfig).(config.Interface)
	//safety check incase this function is called in another way
	if !appConfig.GetBool("web.allow_unsafe_endpoints") {
		c.JSON(http.StatusServiceUnavailable, gin.H{"success": false})
		return
	}

	//!!!!!!INSECURE!!!!!!S
	//We're setting the username to a user provided value, this is insecure, but required for calling databaseRepo fns
	c.Set(pkg.ContextKeyTypeAuthUsername, c.Param("username"))

	GetResourceFhirGraph(c)
}

func UnsafeSyncResourceNames(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	appConfig := c.MustGet(pkg.ContextKeyTypeConfig).(config.Interface)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	//safety check incase this function is called in another way
	if !appConfig.GetBool("web.allow_unsafe_endpoints") {
		c.JSON(http.StatusServiceUnavailable, gin.H{"success": false})
		return
	}

	//verify that c.QueryArray("resourceNames") is not empty
	if len(c.QueryArray("resourceNames")) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "resourceNames query parameter is required"})
		return
	}

	//!!!!!!INSECURE!!!!!!S
	//We're setting the username to a user provided value, this is insecure, but required for calling databaseRepo fns
	c.Set(pkg.ContextKeyTypeAuthUsername, c.Param("username"))

	foundSource, err := databaseRepo.GetSource(c, c.Param("sourceId"))
	if err != nil {
		logger.Errorf("An error occurred while finding source credential: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	if foundSource == nil {
		logger.Errorf("Did not source credentials for %s", c.Param("sourceType"))
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": err.Error()})
		return
	}

	client, err := factory.GetSourceClient(sourcePkg.GetFastenLighthouseEnv(), c, logger, foundSource)
	if err != nil {
		logger.Errorf("Could not initialize source client %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	parsedUrl, err := url.Parse(strings.TrimSuffix(c.Param("path"), "/"))
	if err != nil {
		logger.Errorf("Error parsing request, %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	//make sure we include all query string parameters with the raw request.
	parsedUrl.RawQuery = c.Request.URL.Query().Encode()

	//make sure we store the source credential information in the database, even if the request fails
	defer func() {
		//update source incase the access token/refresh token has been updated
		sourceCredential := client.GetSourceCredential()
		sourceCredentialConcrete, ok := sourceCredential.(*models.SourceCredential)
		if !ok {
			logger.Errorln("An error occurred while updating source credential, source credential is not of type *models.SourceCredential")
			return
		}
		err = databaseRepo.UpdateSource(c, sourceCredentialConcrete)
		if err != nil {
			logger.Errorf("An error occurred while updating source credential: %v", err)
			return
		}
		logger.Info("Successfully updated source credential")
	}()

	upsertSummary, err := client.SyncAllByResourceName(databaseRepo, c.QueryArray("resourceNames"))
	if err != nil {
		logger.Errorf("Error making raw request, %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error(), "data": upsertSummary})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": upsertSummary})
}
