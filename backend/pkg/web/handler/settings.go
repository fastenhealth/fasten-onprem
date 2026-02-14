package handler

import (
	"net/http"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/config"
	"github.com/gin-gonic/gin"
)

// GetSettings godoc
// @Summary Get settings
// @Description Get settings
// @Tags Settings
// @Accept  json
// @Produce  json
// @Success 200 {object} map[string]interface{}
// @Router /settings [get]
func GetSettings(c *gin.Context) {
	cfg := c.MustGet(pkg.ContextKeyTypeConfig).(config.Interface)
	c.JSON(http.StatusOK, gin.H{"search": cfg.Get("search")})
}
