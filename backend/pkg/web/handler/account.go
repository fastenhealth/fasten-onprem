package handler

import (
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"net/http"
)

// GetCurrentUser returns the current user's profile information
func GetCurrentUser(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	currentUser, err := databaseRepo.GetCurrentUser(c)
	if err != nil {
		logger.Errorf("Failed to get current user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get current user"})
		return
	}

	// Create a sanitized user object (without password)
	sanitizedUser := gin.H{
		"id":        currentUser.ID,
		"username":  currentUser.Username,
		"full_name": currentUser.FullName,
		"email":     currentUser.Email,
		"picture":   currentUser.Picture,
		"role":      currentUser.Role,
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    sanitizedUser,
	})
}

// UX: this is a secure endpoint, and should only be called after a double confirmation
func DeleteAccount(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	err := databaseRepo.DeleteCurrentUser(c)

	if err != nil {
		logger.Errorln("An error occurred while deleting current user", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
