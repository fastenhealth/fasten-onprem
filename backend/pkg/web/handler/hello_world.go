package handler

import (
	//"github.com/packagrio/goweb-template/backend/pkg/database"
	"github.com/gin-gonic/gin"
	//"github.com/packagrio/goweb-template/backend/pkg/config"
	//"github.com/sirupsen/logrus"
	"net/http"
)

func GetHelloWorld(c *gin.Context) {
	//logger := c.MustGet("LOGGER").(*logrus.Entry)
	//appConfig := c.MustGet("CONFIG").(config.Interface)

	//device, err := deviceRepo.GetDeviceDetails(c, c.Param("wwn"))
	//if err != nil {
	//	logger.Errorln("An error occurred while retrieving device details", err)
	//	c.JSON(http.StatusInternalServerError, gin.H{"success": false})
	//	return
	//}
	//
	//durationKey, exists := c.GetQuery("duration_key")
	//if !exists {
	//	durationKey = "forever"
	//}
	//
	//smartResults, err := deviceRepo.GetSmartAttributeHistory(c, c.Param("wwn"), durationKey, nil)
	//if err != nil {
	//	logger.Errorln("An error occurred while retrieving device smart results", err)
	//	c.JSON(http.StatusInternalServerError, gin.H{"success": false})
	//	return
	//}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": map[string]interface{}{"hello": "world"}})
}
