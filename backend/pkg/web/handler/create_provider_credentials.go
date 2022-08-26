package handler

import (
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/database"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"net/http"
)

func CreateProviderCredentials(c *gin.Context) {
	logger := c.MustGet("LOGGER").(*logrus.Entry)
	databaseRepo := c.MustGet("REPOSITORY").(database.DatabaseRepository)

	var providerCred models.ProviderCredential
	if err := c.ShouldBindJSON(&providerCred); err != nil {
		logger.Errorln("An error occurred while parsing posted provider credential", err)
		c.JSON(http.StatusBadRequest, gin.H{"success": false})
		return
	}

	logger.Infof("Parsed Create Provider Credentials Payload: %v", providerCred)

	err := databaseRepo.CreateProviderCredentials(c, providerCred)
	if err != nil {
		logger.Errorln("An error occurred while storing provider credential", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": providerCred})
}
