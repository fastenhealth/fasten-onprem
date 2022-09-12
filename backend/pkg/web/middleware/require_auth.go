package middleware

import (
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/auth"
	"github.com/gin-gonic/gin"
	"net/http"
)

func RequireAuth() gin.HandlerFunc {
	return func(context *gin.Context) {
		tokenString := context.GetHeader("Authorization")
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
