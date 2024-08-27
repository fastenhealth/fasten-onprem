package handler

import (
	"net/http"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/gin-gonic/gin"
)

func GetUsers(c *gin.Context) {
	RequireAdmin(c)

	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	users, err := databaseRepo.GetUsers(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	// Remove password field from each user
	var sanitizedUsers []models.User
	for _, user := range users {
		user.Password = "" // Clear the password field
		sanitizedUsers = append(sanitizedUsers, user)
	}

	c.JSON(200, gin.H{"success": true, "data": sanitizedUsers})
}

func CreateUser(c *gin.Context) {
	RequireAdmin(c)

	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	var newUser models.User
	if err := c.ShouldBindJSON(&newUser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	// Set the role to "user" by default
	newUser.Role = models.RoleUser

	err := databaseRepo.CreateUser(c, &newUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": newUser})
}
