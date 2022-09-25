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

			secure := api.Group("/secure").Use(middleware.RequireAuth())
			{
				secure.GET("/summary", handler.GetSummary)

				secure.POST("/source", handler.CreateSource)
				secure.POST("/source/manual", handler.CreateManualSource)
				secure.GET("/source", handler.ListSource)
				secure.GET("/source/:sourceId", handler.GetSource)
				secure.POST("/source/:sourceId/sync", handler.SourceSync)
				secure.GET("/source/:sourceId/summary", handler.GetSourceSummary)
				secure.GET("/resource/fhir", handler.ListResourceFhir) //
				secure.GET("/resource/fhir/:sourceId/:resourceId", handler.GetResourceFhir)
			}

			api.GET("/metadata/source", handler.GetMetadataSource)

			if ae.Config.GetString("log.level") == "DEBUG" {
				//in debug mode, this endpoint lets us request data directly from the source api
				ae.Logger.Warningf("***INSECURE*** ***INSECURE*** DEBUG mode enables developer functionality, including unauthenticated raw api requests")

				//http://localhost:9090/api/raw/test@test.com/436d7277-ad56-41ce-9823-44e353d1b3f6/Patient/smart-1288992
				api.GET("/raw/:username/:sourceId/*path", handler.RawRequestSource)
			}
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
