package handler

import (
	"errors"
	"net/http"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetUsers(c *gin.Context) {
	if !IsAdmin(c) {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Unauthorized"})
		return
	}

	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	users, err := databaseRepo.GetUsers(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"success": true, "data": users})
}

func CreateUser(c *gin.Context) {
	if !IsAdmin(c) {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Unauthorized"})
		return
	}

	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	var newUser models.User
	if err := c.ShouldBindJSON(&newUser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	err := databaseRepo.CreateUser(c, &newUser)
	if err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "User already exists"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": newUser})
}
