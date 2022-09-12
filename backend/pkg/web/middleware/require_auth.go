package middleware

import (
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/auth"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"strings"
)

func RequireAuth() gin.HandlerFunc {
	return func(context *gin.Context) {
		authHeader := context.GetHeader("Authorization")
		authHeaderParts := strings.Split(authHeader, " ")

		if len(authHeaderParts) != 2 {
			log.Println("Authentication header is invalid: " + authHeader)
			context.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "request does not contain a valid token"})
			context.Abort()
			return
		}

		tokenString := authHeaderParts[1]

		if tokenString == "" {
			context.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "request does not contain an access token"})
			context.Abort()
			return
		}
		err := auth.ValidateToken(tokenString)
		if err != nil {
			context.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": err.Error()})
			context.Abort()
			return
		}
		context.Next()
	}
}
