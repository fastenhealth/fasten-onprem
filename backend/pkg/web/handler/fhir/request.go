package fhir

import (
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/database"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"net/http"
)

func Request(c *gin.Context) {
	logger := c.MustGet("LOGGER").(*logrus.Entry)
	_ = c.MustGet("REPOSITORY").(database.DatabaseRepository)

	//err := databaseRepo.FHIRRequest(c)
	var err error
	if err != nil {
		logger.Errorln("An error occurred while storing provider credential", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": nil})
}
