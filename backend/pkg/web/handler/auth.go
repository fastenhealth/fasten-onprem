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
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	err := databaseRepo.CreateUser(c, &user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	//TODO: we can derive the encryption key and the hash'ed user from the responseData sub. For now the Sub will be the user id prepended with hello.
	userFastenToken, err := auth.JwtGenerateFastenTokenFromUser(user, appConfig.GetString("jwt.issuer.key"))

	c.JSON(http.StatusOK, gin.H{"success": true, "data": userFastenToken})
}

func AuthSignin(c *gin.Context) {
	databaseRepo := c.MustGet("REPOSITORY").(database.DatabaseRepository)
	appConfig := c.MustGet("CONFIG").(config.Interface)

	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
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

	//TODO: we can derive the encryption key and the hash'ed user from the responseData sub. For now the Sub will be the user id prepended with hello.
	userFastenToken, err := auth.JwtGenerateFastenTokenFromUser(user, appConfig.GetString("jwt.issuer.key"))

	c.JSON(http.StatusOK, gin.H{"success": true, "data": userFastenToken})
}
