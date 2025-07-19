package handler

import (
	"net/http"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/config"
	"github.com/gin-gonic/gin"
)

// GetEnv godoc
// @Summary Get environment variables
// @Description Get environment variables
// @Tags Env
// @Accept  json
// @Produce  json
// @Success 200 {object} map[string]interface{}
// @Router /env [get]
func GetEnv(c *gin.Context) {
	cfg := c.MustGet(pkg.ContextKeyTypeConfig).(config.Interface)
	c.JSON(http.StatusOK, gin.H{"typesense": cfg.Get("typesense")})
}
