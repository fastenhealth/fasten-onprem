package middleware

import (
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/auth"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/config"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"strings"
)

func RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		appConfig := c.MustGet(pkg.ContextKeyTypeConfig).(config.Interface)

		authHeader := c.GetHeader("Authorization")
		authHeaderParts := strings.Split(authHeader, " ")

		if len(authHeaderParts) != 2 {
			log.Println("Authentication header is invalid: " + authHeader)
			c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "request does not contain a valid token"})
			c.Abort()
			return
		}

		tokenString := authHeaderParts[1]

		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "request does not contain an access token"})
			c.Abort()
			return
		}
		
		// Parse token using existing JWT function
		claims, err := auth.JwtValidateFastenToken(appConfig.GetString("jwt.issuer.key"), tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": err.Error()})
			c.Abort()
			return
		}
		
		// Check if it's a sync token
		if claims.TokenType == "sync" {
			databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)
			token, err := databaseRepo.GetSyncToken(c, claims.TokenID)
			if err != nil || token == nil {
				c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Invalid sync token"})
				c.Abort()
				return
			}
			if !token.IsActive || token.IsRevoked || token.IsExpired() {
				c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Sync token is revoked, inactive, or expired"})
				c.Abort()
				return
			}
		}
		
		// Set context for both regular and sync tokens
		c.Set(pkg.ContextKeyTypeAuthToken, tokenString)
		c.Set(pkg.ContextKeyTypeAuthUsername, claims.Subject)
		c.Next()
	}
}
