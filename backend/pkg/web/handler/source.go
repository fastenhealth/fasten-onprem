package handler

import (
	"fmt"
	"github.com/fastenhealth/fasten-sources/clients/factory"
	sourceModels "github.com/fastenhealth/fasten-sources/clients/models"
	sourcePkg "github.com/fastenhealth/fasten-sources/pkg"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/database"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"
)

func CreateSource(c *gin.Context) {
	logger := c.MustGet("LOGGER").(*logrus.Entry)
	databaseRepo := c.MustGet("REPOSITORY").(database.DatabaseRepository)

	sourceCred := models.SourceCredential{}
	if err := c.ShouldBindJSON(&sourceCred); err != nil {
		logger.Errorln("An error occurred while parsing posted source credential", err)
		c.JSON(http.StatusBadRequest, gin.H{"success": false})
		return
	}

	logger.Infof("Parsed Create SourceCredential Credentials Payload: %v", sourceCred)

	err := databaseRepo.CreateSource(c, &sourceCred)
	if err != nil {
		logger.Errorln("An error occurred while storing source credential", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}

	// after creating the source, we should do a bulk import
	summary, err := syncSourceResources(c, logger, databaseRepo, sourceCred)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "source": sourceCred, "data": summary})
}

func SourceSync(c *gin.Context) {
	logger := c.MustGet("LOGGER").(*logrus.Entry)
	databaseRepo := c.MustGet("REPOSITORY").(database.DatabaseRepository)

	logger.Infof("Get SourceCredential Credentials: %v", c.Param("sourceId"))

	sourceCred, err := databaseRepo.GetSource(c, c.Param("sourceId"))
	if err != nil {
		logger.Errorln("An error occurred while retrieving source credential", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}

	// after creating the source, we should do a bulk import
	summary, err := syncSourceResources(c, logger, databaseRepo, *sourceCred)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "source": sourceCred, "data": summary})
}

func CreateManualSource(c *gin.Context) {
	logger := c.MustGet("LOGGER").(*logrus.Entry)
	databaseRepo := c.MustGet("REPOSITORY").(database.DatabaseRepository)

	// single file
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "could not extract file from form"})
		return
	}
	fmt.Printf("Uploaded filename: %s", file.Filename)

	// create a temporary file to store this uploaded file
	bundleFile, err := ioutil.TempFile("", file.Filename)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "could not create temp file"})
		return
	}

	// Upload the file to specific bundleFile.
	err = c.SaveUploadedFile(file, bundleFile.Name())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "could not save temp file"})
		return
	}

	// We cannot save the "SourceCredential" object yet, as we do not know the patientID

	// create a "manual" client, which we can use to parse the
	manualSourceClient, _, err := factory.GetSourceClient(sourcePkg.GetFastenEnv(), sourcePkg.SourceTypeManual, c, logger, models.SourceCredential{})
	if err != nil {
		logger.Errorln("An error occurred while initializing hub client using manual source without credentials", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}

	summary, err := manualSourceClient.SyncAllBundle(databaseRepo, bundleFile)
	if err != nil {
		logger.Errorln("An error occurred while processing bundle", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": summary})
}

func GetSource(c *gin.Context) {
	logger := c.MustGet("LOGGER").(*logrus.Entry)
	databaseRepo := c.MustGet("REPOSITORY").(database.DatabaseRepository)

	sourceCred, err := databaseRepo.GetSource(c, c.Param("sourceId"))
	if err != nil {
		logger.Errorln("An error occurred while retrieving source credential", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": sourceCred})
}

func GetSourceSummary(c *gin.Context) {
	logger := c.MustGet("LOGGER").(*logrus.Entry)
	databaseRepo := c.MustGet("REPOSITORY").(database.DatabaseRepository)

	sourceSummary, err := databaseRepo.GetSourceSummary(c, c.Param("sourceId"))
	if err != nil {
		logger.Errorln("An error occurred while retrieving source summary", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": sourceSummary})
}

func ListSource(c *gin.Context) {
	logger := c.MustGet("LOGGER").(*logrus.Entry)
	databaseRepo := c.MustGet("REPOSITORY").(database.DatabaseRepository)

	sourceCreds, err := databaseRepo.GetSources(c)
	if err != nil {
		logger.Errorln("An error occurred while listing source credentials", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": sourceCreds})
}

func RawRequestSource(c *gin.Context) {
	logger := c.MustGet("LOGGER").(*logrus.Entry)
	databaseRepo := c.MustGet("REPOSITORY").(database.DatabaseRepository)

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

	client, updatedSource, err := factory.GetSourceClient(sourcePkg.GetFastenEnv(), foundSource.SourceType, c, logger, foundSource)
	if err != nil {
		logger.Errorf("Could not initialize source client %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	//TODO: if source has been updated, we should save the access/refresh token.
	if updatedSource != nil {
		logger.Warnf("TODO: source credential has been updated, we should store it in the database: %v", updatedSource)
		//	err := databaseRepo.CreateSource(c, updatedSource)
		//	if err != nil {
		//		logger.Errorf("An error occurred while updating source credential %v", err)
		//		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		//		return
		//	}
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

	err = client.GetRequest(parsedUrl.String(), &resp)
	if err != nil {
		logger.Errorf("Error making raw request, %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error(), "data": resp})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": resp})
}

////// private functions
func syncSourceResources(c *gin.Context, logger *logrus.Entry, databaseRepo database.DatabaseRepository, sourceCred models.SourceCredential) (sourceModels.UpsertSummary, error) {
	// after creating the source, we should do a bulk import
	sourceClient, updatedSource, err := factory.GetSourceClient(sourcePkg.GetFastenEnv(), sourceCred.SourceType, c, logger, sourceCred)
	if err != nil {
		logger.Errorln("An error occurred while initializing hub client using source credential", err)
		return sourceModels.UpsertSummary{}, err
	}
	//TODO: update source
	if updatedSource != nil {
		logger.Warnf("TODO: source credential has been updated, we should store it in the database: %v", updatedSource)
		//err := databaseRepo.CreateSource(c, updatedSource)
		//if err != nil {
		//	logger.Errorln("An error occurred while updating source credential", err)
		//	return err
		//}
	}

	summary, err := sourceClient.SyncAll(databaseRepo)
	if err != nil {
		logger.Errorln("An error occurred while bulk import of resources from source", err)
		return summary, err
	}
	return summary, nil
}
