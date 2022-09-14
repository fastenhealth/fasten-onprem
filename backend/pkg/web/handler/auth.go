package handler

import (
	"fmt"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/auth"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/database"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/gin-gonic/gin"
	"net/http"
)

func AuthSignup(c *gin.Context) {
	databaseRepo := c.MustGet("REPOSITORY").(database.DatabaseRepository)
	appConfig := c.MustGet("CONFIG").(config.Interface)

	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}
	err := databaseRepo.CreateUser(c, &user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}

	// return JWT
	tokenString, err := auth.GenerateJWT(appConfig.GetString("web.jwt.encryptionkey"), user.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": tokenString})
}

func AuthSignin(c *gin.Context) {
	databaseRepo := c.MustGet("REPOSITORY").(database.DatabaseRepository)
	appConfig := c.MustGet("CONFIG").(config.Interface)

	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}

	foundUser, err := databaseRepo.GetUserByEmail(c, user.Username)
	if err != nil || foundUser == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": fmt.Sprintf("could not find user: %s", user.Username)})
		return
	}

	err = foundUser.CheckPassword(user.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": fmt.Sprintf("username or password does not match: %s", user.Username)})
		return
	}

	// return JWT
	tokenString, err := auth.GenerateJWT(appConfig.GetString("web.jwt.encryptionkey"), user.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "an error occurred generating JWT token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": tokenString})
}
