package handler

import (
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/database"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/gin-gonic/gin"
	jwt "github.com/golang-jwt/jwt/v4"
	"log"
	"net/http"
	"time"
)

func AuthSignup(c *gin.Context) {
	databaseRepo := c.MustGet("REPOSITORY").(database.DatabaseRepository)

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

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func AuthSignin(c *gin.Context) {
	databaseRepo := c.MustGet("REPOSITORY").(database.DatabaseRepository)
	appConfig := c.MustGet("CONFIG").(config.Interface)

	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	err := databaseRepo.VerifyUser(c, &user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	//TODO: we can derive the encryption key and the hash'ed user from the responseData sub. For now the Sub will be the user id prepended with hello.
	userFastenToken, err := jwtGenerateFastenTokenFromUser(user, appConfig.GetString("jwt.issuer.key"))

	c.JSON(http.StatusOK, gin.H{"success": true, "data": userFastenToken})
}

func jwtGenerateFastenTokenFromUser(user models.User, issuerSigningKey string) (string, error) {
	log.Printf("ISSUER KEY: " + issuerSigningKey)
	userClaims := jwt.RegisteredClaims{
		// In JWT, the expiry time is expressed as unix milliseconds
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
		Issuer:    "docker-fastenhealth",
		Subject:   user.Username,
	}

	//FASTEN_JWT_ISSUER_KEY
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, userClaims)
	//token.Header["kid"] = "docker"
	tokenString, err := token.SignedString([]byte(issuerSigningKey))

	if err != nil {
		return "", err
	}
	return tokenString, nil
}
