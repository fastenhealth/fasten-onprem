package handler

import (
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

func GetToken(c *gin.Context) {
	token := appConfig.GetString("database.encryption_key")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "token is miss"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": token})

	// Shutdown the server gracefully
	go func() {
		time.Sleep(1 * time.Second)
		os.Exit(0)
	}()
}
