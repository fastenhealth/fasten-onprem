package raw

import (
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/database"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/hub"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"net/http"
)

func Request(c *gin.Context) {
	logger := c.MustGet("LOGGER").(*logrus.Entry)
	databaseRepo := c.MustGet("REPOSITORY").(database.DatabaseRepository)

	sources, err := databaseRepo.GetSources(c)
	if err != nil {
		logger.Errorln("An error occurred while storing provider credential", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}

	var foundSource *models.Source
	for _, source := range sources {
		if source.ProviderId == c.Param("sourceType") {
			foundSource = &source
		}
	}

	if foundSource == nil {
		logger.Errorf("Did not source credentials for %s", c.Param("sourceType"))
		c.JSON(http.StatusNotFound, gin.H{"success": false})
		return
	}

	client, err := hub.NewClient(c.Param("sourceType"), nil, logger, *foundSource)
	if err != nil {
		logger.Errorf("Could not initialize source client", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}
	var resp map[string]interface{}
	err = client.GetRequest(c.Param("path"), &resp)
	if err != nil {
		logger.Errorf("Error making raw request", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": resp})
}
