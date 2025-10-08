package handler

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/auth"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/config"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type UserWizard struct {
	*models.User    `json:",inline"`
	JoinMailingList bool `json:"join_mailing_list"`
}

func IsAdmin(c *gin.Context) bool {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	currentUser, err := databaseRepo.GetCurrentUser(c)
	if err != nil {
		logger.Errorf("Error getting current user: %v", err)
		return false
	}
	return currentUser.Role == pkg.UserRoleAdmin
}

func AuthSignup(c *gin.Context) {
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)
	appConfig := c.MustGet(pkg.ContextKeyTypeConfig).(config.Interface)

	var userWizard UserWizard
	if err := c.ShouldBindJSON(&userWizard); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	// Check if this is the first user in the database
	userCount, err := databaseRepo.GetUserCount(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to check user count"})
		return
	}

	if userCount == 0 {
		userWizard.User.Role = pkg.UserRoleAdmin
	} else {
		userWizard.User.Role = pkg.UserRoleUser
	}
	err = databaseRepo.CreateUser(c, userWizard.User)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	//TODO: we can derive the encryption key and the hash'ed user from the responseData sub. For now the Sub will be the user id prepended with hello.
	userFastenToken, err := auth.JwtGenerateFastenTokenFromUser(*userWizard.User, appConfig.GetString("jwt.issuer.key"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	//check if the user wants to join the mailing list
	if userWizard.JoinMailingList {
		//ignore error messages, we don't want to block the user from signing up
		utils.JoinNewsletter(userWizard.FullName, userWizard.Email, "", "")
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": userFastenToken})
}

func AuthSignin(c *gin.Context) {
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)
	appConfig := c.MustGet(pkg.ContextKeyTypeConfig).(config.Interface)

	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	foundUser, err := databaseRepo.GetUserByUsername(c, user.Username)
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
	userFastenToken, err := auth.JwtGenerateFastenTokenFromUser(*foundUser, appConfig.GetString("jwt.issuer.key"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": userFastenToken})
}

// LoginHandler returns a gin.HandlerFunc bound to a given OIDCManager
func LoginHandler(mgr *auth.OIDCManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		provider := c.Param("provider")
		p, ok := mgr.Providers[provider]
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"error": "unknown provider"})
			return
		}

		state := "random_state" // TODO: generate securely and persist in cookie/session
		url := p.OAuth2.AuthCodeURL(state)
		c.Redirect(http.StatusFound, url)
	}
}

// Helper function to generate a random password for OIDC-created users
func generateRandomPassword() string {
	bytes := make([]byte, 16)
	_, _ = rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

// CallbackHandler handles OIDC provider responses
func CallbackHandler(mgr *auth.OIDCManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := context.Background()
		provider := c.Param("provider")

		p, ok := mgr.Providers[provider]
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "unknown provider"})
			return
		}

		code := c.Query("code")
		if code == "" {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "missing code"})
			return
		}

		token, err := p.OAuth2.Exchange(ctx, code)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "token exchange failed"})
			return
		}

		rawIDToken, ok := token.Extra("id_token").(string)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "no id_token in token response"})
			return
		}

		verifier := p.Provider.Verifier(&oidc.Config{ClientID: p.Config.ClientID})
		idToken, err := verifier.Verify(ctx, rawIDToken)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "invalid id_token"})
			return
		}

		var claims struct {
			Email string `json:"email"`
			Name  string `json:"name"`
			Sub   string `json:"sub"`
		}
		if err := idToken.Claims(&claims); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "failed to parse claims"})
			return
		}

		// Extract our context values
		databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)
		appConfig := c.MustGet(pkg.ContextKeyTypeConfig).(config.Interface)

		foundUser, err := databaseRepo.GetUserByUsername(c, claims.Email)
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "database error"})
			return
		}

		if foundUser == nil || errors.Is(err, gorm.ErrRecordNotFound) {
			newUser := &models.User{
				Username: claims.Email,
				Email:    claims.Email,
				FullName: claims.Name,
				AuthType: "google",
				Password: generateRandomPassword(), // Random password, won't be used, but required by the model
			}

			if err := databaseRepo.CreateUser(c, newUser); err != nil {
				// Log incoming error but return a generic message to the user
				logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
				logger.Errorf("Error creating user from OIDC login: %v", err)

				c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "failed to create user"})
				return
			}

			foundUser = newUser
		}

		// Generate the same JWT the normal signin flow uses
		userFastenToken, err := auth.JwtGenerateFastenTokenFromUser(*foundUser, appConfig.GetString("jwt.issuer.key"))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    userFastenToken,
		})
	}
}

// ListAuthMethodsHandler returns a handler that lists all configured OIDC providers.
func ListAuthMethodsHandler(mgr *auth.OIDCManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get the list of providers from the manager.
		providers := mgr.GetProviders()

		// Respond with a 200 OK and the JSON-encoded list of providers.
		// The output will look like: [{"name":"google"},{"name":"another_provider"}]
		c.JSON(http.StatusOK, providers)
	}
}
