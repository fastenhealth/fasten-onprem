package web

import (
	"fmt"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/web/handler"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/web/middleware"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"net/http"
	"strings"
)

type AppEngine struct {
	Config config.Interface
	Logger *logrus.Entry
}

func (ae *AppEngine) Setup(logger *logrus.Entry) *gin.Engine {
	r := gin.New()

	r.Use(middleware.LoggerMiddleware(logger))
	r.Use(middleware.RepositoryMiddleware(ae.Config, logger))
	r.Use(middleware.ConfigMiddleware(ae.Config))
	r.Use(gin.Recovery())

	basePath := ae.Config.GetString("web.listen.basepath")
	logger.Debugf("basepath: %s", basePath)

	base := r.Group(basePath)
	{
		api := base.Group("/api")
		{
			api.GET("/health", func(c *gin.Context) {
				//TODO:
				// check if the /web folder is populated.
				// check if access to database
				c.JSON(http.StatusOK, gin.H{
					"success": true,
				})
			})

			api.POST("/auth/signup", handler.AuthSignup)
			api.POST("/auth/signin", handler.AuthSignin)

			r.Any("/database/*proxyPath", handler.CouchDBProxy)
			r.GET("/cors/*proxyPath", handler.CORSProxy)
			r.OPTIONS("/cors/*proxyPath", handler.CORSProxy)
		}
	}

	//Static request routing
	base.StaticFS("/web", http.Dir(ae.Config.GetString("web.src.frontend.path")))

	//redirect base url to /web
	base.GET("/", func(c *gin.Context) {
		c.Redirect(http.StatusFound, basePath+"/web")
	})

	//catch-all, serve index page.
	r.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path
		if strings.HasPrefix(path, "/api") || strings.HasPrefix(path, "/api") {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "404 endpoint not found"})
		} else {
			c.File(fmt.Sprintf("%s/index.html", ae.Config.GetString("web.src.frontend.path")))
		}
	})
	return r
}

func (ae *AppEngine) Start() error {
	//set the gin mode
	gin.SetMode(gin.ReleaseMode)
	if strings.ToLower(ae.Config.GetString("log.level")) == "debug" {
		gin.SetMode(gin.DebugMode)
	}

	r := ae.Setup(ae.Logger)

	return r.Run(fmt.Sprintf("%s:%s", ae.Config.GetString("web.listen.host"), ae.Config.GetString("web.listen.port")))
}
