package handler

import (
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/database"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"net/http"
	"strings"
)

func RequestResourceFhir(c *gin.Context) {
	logger := c.MustGet("LOGGER").(*logrus.Entry)
	databaseRepo := c.MustGet("REPOSITORY").(database.DatabaseRepository)

	sourceResourceId := strings.Trim(c.Param("sourceResourceId"), "/")
	wrappedResourceModels, err := databaseRepo.ListResources(c, c.Param("sourceResourceType"), sourceResourceId)

	if err != nil {
		logger.Errorln("An error occurred while retrieving resources", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": wrappedResourceModels})
}
