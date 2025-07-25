package handler

import (
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
)

func SetupToken(c *gin.Context) {
	tokenPath := "/opt/fasten/encrypt_db/token"
	token := c.PostForm("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "token is required"})
		return
	}

	dir := filepath.Dir(tokenPath)
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		if err := os.MkdirAll(dir, 0700); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "failed to create token directory"})
			return
		}
	}

	// NOTE: this is a simplified version of SaveTokenToFile from the encryption package
	if err := os.WriteFile(tokenPath, []byte(token), 0600); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "failed to save token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})

	// Shutdown the server gracefully
	go func() {
		time.Sleep(1 * time.Second)
		os.Exit(0)
	}()
}
