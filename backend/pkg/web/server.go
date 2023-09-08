package web

import (
	"embed"
	"fmt"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/config"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/web/handler"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/web/middleware"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"net/http"
	"strings"
)

type AppEngine struct {
	Config config.Interface
	Logger *logrus.Entry
}

func (ae *AppEngine) Setup() (*gin.RouterGroup, *gin.Engine) {
	r := gin.New()

	r.Use(middleware.LoggerMiddleware(ae.Logger))
	r.Use(middleware.RepositoryMiddleware(ae.Config, ae.Logger))
	r.Use(middleware.ConfigMiddleware(ae.Config))
	r.Use(gin.Recovery())

	basePath := ae.Config.GetString("web.listen.basepath")
	ae.Logger.Debugf("basepath: %s", basePath)

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
			//
			//r.Any("/database/*proxyPath", handler.CouchDBProxy)
			//r.GET("/cors/*proxyPath", handler.CORSProxy)
			//r.OPTIONS("/cors/*proxyPath", handler.CORSProxy)
			api.GET("/glossary/code", handler.GlossarySearchByCode)

			secure := api.Group("/secure").Use(middleware.RequireAuth())
			{
				secure.GET("/summary", handler.GetSummary)

				secure.POST("/source", handler.CreateSource)
				secure.POST("/source/manual", handler.CreateManualSource)
				secure.GET("/source", handler.ListSource)
				secure.GET("/source/:sourceId", handler.GetSource)
				secure.POST("/source/:sourceId/sync", handler.SourceSync)
				secure.GET("/source/:sourceId/summary", handler.GetSourceSummary)
				secure.GET("/resource/fhir", handler.ListResourceFhir)
				secure.GET("/resource/graph/:graphType", handler.GetResourceFhirGraph)
				secure.GET("/resource/fhir/:sourceId/:resourceId", handler.GetResourceFhir)
				secure.POST("/resource/composition", handler.CreateResourceComposition)

				secure.GET("/dashboards", handler.GetDashboard)
				secure.POST("/dashboards", handler.AddDashboardLocation)
				//secure.GET("/dashboard/:dashboardId", handler.GetDashboard)

				secure.POST("/query", handler.QueryResourceFhir)

				//server-side-events handler
				secure.GET("/sse/stream", middleware.SSEHeaderMiddleware(), middleware.SSEEventBusServerMiddleware(), handler.SSEStream)
			}

			if ae.Config.GetBool("web.allow_unsafe_endpoints") {
				//this endpoint lets us request data directly from the source api
				ae.Logger.Warningln("***UNSAFE***")
				ae.Logger.Warningln("***UNSAFE***")
				ae.Logger.Warningln("***UNSAFE***")
				ae.Logger.Warningln("***UNSAFE***")
				ae.Logger.Warningln("***UNSAFE***")
				ae.Logger.Warningf("\"web.allow_unsafe_endpoints\" mode enabled!! This enables developer functionality, including unauthenticated raw api requests")
				ae.Logger.Warningln("***UNSAFE***")
				ae.Logger.Warningln("***UNSAFE***")
				ae.Logger.Warningln("***UNSAFE***")
				ae.Logger.Warningln("***UNSAFE***")
				ae.Logger.Warningln("***UNSAFE***")
				unsafe := api.Group("/unsafe")
				{
					//http://localhost:9090/api/unsafe/testuser1/3508f8cf-6eb9-4e4b-8174-dd69a493a2b4/Patient/smart-1288992
					unsafe.GET("/:username/:sourceId/*path", handler.UnsafeRequestSource)
					unsafe.GET("/:username/graph/:graphType", handler.UnsafeResourceGraph)

				}
			}
		}
	}

	return base, r
}

func (ae *AppEngine) SetupFrontendRouting(base *gin.RouterGroup, router *gin.Engine) *gin.Engine {
	//Static request routing
	base.StaticFS("/web", http.Dir(ae.Config.GetString("web.src.frontend.path")))

	//redirect base url to /web
	base.GET("/", func(c *gin.Context) {
		c.Redirect(http.StatusFound, ae.Config.GetString("web.listen.basepath")+"/web")
	})

	//catch-all, serve index page.
	router.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path
		if strings.HasPrefix(path, "/api") {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "404 endpoint not found"})
		} else {
			c.File(fmt.Sprintf("%s/index.html", ae.Config.GetString("web.src.frontend.path")))
		}
	})
	return router
}

func (ae *AppEngine) SetupEmbeddedFrontendRouting(embeddedAssetsFS embed.FS, base *gin.RouterGroup, router *gin.Engine) *gin.Engine {
	//Static request routing
	base.StaticFS("/web", http.FS(embeddedAssetsFS))

	//redirect base url to /web
	base.GET("/", func(c *gin.Context) {
		c.Redirect(http.StatusFound, ae.Config.GetString("web.listen.basepath")+"/web")
	})

	//catch-all, serve index page.
	router.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path
		if strings.HasPrefix(path, "/api") {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "404 endpoint not found"})
		} else {
			ae.Logger.Infof("could not find %s, fallback to index.html", path)
			c.FileFromFS("index.html", http.FS(embeddedAssetsFS))
		}
	})
	return router
}

func (ae *AppEngine) Start() error {
	//set the gin mode
	gin.SetMode(gin.ReleaseMode)
	if strings.ToLower(ae.Config.GetString("log.level")) == "debug" {
		gin.SetMode(gin.DebugMode)
	}

	baseRouterGroup, ginRouter := ae.Setup()
	r := ae.SetupFrontendRouting(baseRouterGroup, ginRouter)

	return r.Run(fmt.Sprintf("%s:%s", ae.Config.GetString("web.listen.host"), ae.Config.GetString("web.listen.port")))
}
