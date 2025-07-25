package web

import (
	"bytes"
	"context"
	"embed"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"runtime"
	"strings"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/config"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/event_bus"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/web/handler"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/web/middleware"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type AppEngine struct {
	Config     config.Interface
	Logger     *logrus.Entry
	EventBus   event_bus.Interface
	deviceRepo database.DatabaseRepository

	RelatedVersions map[string]string //related versions metadata provided & embedded by the build process
}

func (ae *AppEngine) Setup() (*gin.RouterGroup, *gin.Engine) {
	r := gin.New()

	//setup database
	deviceRepo, err := database.NewRepository(ae.Config, ae.Logger, ae.EventBus)
	if err != nil {
		panic(err)
	}
	ae.deviceRepo = deviceRepo

	r.Use(middleware.LoggerMiddleware(ae.Logger))
	r.Use(middleware.RepositoryMiddleware(ae.deviceRepo))
	r.Use(middleware.ConfigMiddleware(ae.Config))
	r.Use(middleware.EventBusMiddleware(ae.EventBus))
	r.Use(gin.Recovery())

	basePath := ae.Config.GetString("web.listen.basepath")
	ae.Logger.Debugf("basepath: %s", basePath)

	base := r.Group(basePath)
	{
		api := base.Group("/api")
		{
			api.Use(middleware.CacheMiddleware())
			api.GET("/health", func(c *gin.Context) {
				// This function does a quick check to see if the server is up and running
				// it will also determine if we should show the first run wizard

				//TODO:
				// check if the /web folder is populated.

				//get the count of users in the DB
				databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)
				userCount, err := databaseRepo.GetUserCount(c)
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"success": false})
					return
				}

				keepAliveMsg := models.NewEventKeepAlive("heartbeat")
				err = ae.EventBus.PublishMessage(keepAliveMsg)
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"success": false})
					return
				}

				c.JSON(http.StatusOK, gin.H{
					"success": true,
					"data": gin.H{
						"first_run_wizard": userCount == 0,
					},
				})
			})

			api.POST("/auth/signup", handler.AuthSignup)
			api.POST("/auth/signin", handler.AuthSignin)

			//whitelisted CORS PROXY
			api.GET("/cors/:endpointId/*proxyPath", handler.CORSProxy)
			api.POST("/cors/:endpointId/*proxyPath", handler.CORSProxy)
			api.OPTIONS("/cors/:endpointId/*proxyPath", handler.CORSProxy)

			api.GET("/glossary/code", handler.GlossarySearchByCode)
			api.POST("/support/request", handler.SupportRequest)
			api.POST("/support/healthsystem", handler.HealthSystemRequest)

			secure := api.Group("/secure").Use(middleware.RequireAuth())
			{
				secure.DELETE("/account/me", handler.DeleteAccount)

				secure.GET("/summary", handler.GetSummary)
				secure.GET("/summary/ips", handler.GetIPSSummary)
				secure.GET("/ping", func(c *gin.Context) {
					c.JSON(http.StatusOK, gin.H{"success": true, "message": "Connection valid"})
				})

				secure.POST("/source", handler.CreateReconnectSource)
				secure.POST("/source/manual", handler.CreateManualSource)
				secure.GET("/source", handler.ListSource)
				secure.GET("/source/:sourceId", handler.GetSource)
				secure.DELETE("/source/:sourceId", handler.DeleteSource)
				secure.POST("/source/:sourceId/sync", handler.SourceSync)
				secure.GET("/source/:sourceId/summary", handler.GetSourceSummary)
				secure.GET("/resource/fhir", handler.ListResourceFhir)
				secure.POST("/resource/graph/:graphType", handler.GetResourceFhirGraph)
				secure.GET("/resource/fhir/:sourceId/:resourceId", handler.GetResourceFhir)
				secure.PATCH("/resource/fhir/:resourceType/:resourceId", handler.UpdateResourceFhir)

				secure.POST("/resource/composition", handler.CreateResourceComposition)
				secure.POST("/resource/related", handler.CreateRelatedResources)
				secure.DELETE("/encounter/:encounterId/related/:resourceType/:resourceId", handler.EncounterUnlinkResource)

				secure.GET("/dashboards", handler.GetDashboard)
				secure.POST("/dashboards", handler.AddDashboardLocation)
				//secure.GET("/dashboard/:dashboardId", handler.GetDashboard)

				secure.GET("/jobs", handler.ListBackgroundJobs)
				secure.POST("/jobs/error", handler.CreateBackgroundJobError)

				secure.POST("/query", handler.QueryResourceFhir)

				secure.GET("/users", handler.GetUsers)
				secure.POST("/users", handler.CreateUser)

				secure.GET("/sync/initiate", handler.InitiateSync)
				secure.GET("/sync/status", handler.GetSyncStatus)
				secure.GET("/sync/discovery", handler.GetServerDiscovery)
				secure.GET("/sync/data", handler.SyncData)
				secure.GET("/sync/updates", handler.SyncDataUpdates)

				// Sync token management
				secure.GET("/sync/tokens", handler.GetSyncTokens)
				secure.GET("/sync/history", handler.GetSyncHistory)
				secure.GET("/sync/device-history", handler.GetDeviceSyncHistory)
				secure.POST("/sync/revoke", handler.RevokeSync)
				secure.POST("/sync/revoke-all", handler.RevokeAllSyncTokens)
				secure.POST("/sync/delete", handler.DeleteSyncToken)
				secure.POST("/sync/delete-all", handler.DeleteAllSyncTokens)

				//server-side-events handler (only supported on mac/linux)
				// TODO: causes deadlock on Windows
				if runtime.GOOS != "windows" {
					secure.GET("/events/stream",
						middleware.SSEHeaderMiddleware(),
						handler.SSEEventBusServerHandler(ae.EventBus),
					)
				}
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
					unsafe.GET("/:username/sync/:sourceId", handler.UnsafeSyncResourceNames)

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

func (ae *AppEngine) SetupInstallationRegistration() error {
	//check if installation is already registered
	systemSettings, err := ae.deviceRepo.LoadSystemSettings(context.Background())
	if err != nil {
		return fmt.Errorf("an error occurred while loading system settings: %s", err)
	}

	if systemSettings.InstallationID != "" && systemSettings.InstallationSecret != "" {
		//already setup, exit
		//TODO: future, update fasten-onprem, fasten-sources version
		return nil
	}

	//setup the installation registration payload
	registrationData := &models.InstallationRegistrationRequest{
		SoftwareArchitecture: runtime.GOARCH,
		SoftwareOS:           runtime.GOOS,
	}

	if ae.RelatedVersions != nil {
		if fastenSourcesVersion, fastenSourcesVersionOk := ae.RelatedVersions["sources"]; fastenSourcesVersionOk {
			registrationData.FastenSourcesVersion = fastenSourcesVersion
		}
		if fastenOnpremVersion, fastenOnpremVersionOk := ae.RelatedVersions["onprem"]; fastenOnpremVersionOk {
			registrationData.FastenOnpremVersion = fastenOnpremVersion
		}
		if fastenDesktopVersion, fastenDesktopVersionOk := ae.RelatedVersions["desktop"]; fastenDesktopVersionOk {
			registrationData.FastenDesktopVersion = fastenDesktopVersion
		}
	}

	//setup the http request
	registrationDataJson, err := json.Marshal(registrationData)
	if err != nil {
		return fmt.Errorf("an error occurred while serializing installation registration data: %s", err)
	}

	//send the registration request
	resp, err := http.Post(
		"https://api.platform.fastenhealth.com/v1/installation/register",
		"application/json",
		bytes.NewBuffer(registrationDataJson),
	)
	if err != nil {
		return fmt.Errorf("an error occurred while sending installation registration request: %s", err)
	} else if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("an error occurred while sending installation registration request: %s", resp.Status)
	}
	defer resp.Body.Close()

	//unmarshal the registration response
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("an error occurred while reading installation registration response: %s", err)
	}
	var registrationResponse models.ResponseWrapperTyped[models.InstallationRegistrationResponse]
	err = json.Unmarshal(bodyBytes, &registrationResponse)
	if err != nil {
		return fmt.Errorf("an error occurred while unmarshalling installation registration response: %s", err)
	}

	//now that we have the registration response, store the registration data in the system settings
	systemSettings.InstallationID = registrationResponse.Data.InstallationID
	systemSettings.InstallationSecret = registrationResponse.Data.InstallationSecret

	ae.Logger.Infof("Saving installation id to settings table: %s", systemSettings.InstallationID)

	//save the system settings
	err = ae.deviceRepo.SaveSystemSettings(context.Background(), systemSettings)
	if err != nil {
		return fmt.Errorf("an error occurred while saving system settings: %s", err)
	}
	return nil
}

func (ae *AppEngine) Start() error {
	//set the gin mode
	gin.SetMode(gin.ReleaseMode)
	if strings.ToLower(ae.Config.GetString("log.level")) == "debug" {
		gin.SetMode(gin.DebugMode)
	}

	baseRouterGroup, ginRouter := ae.Setup()
	err := ae.SetupInstallationRegistration()
	if err != nil {
		return err
	}
	r := ae.SetupFrontendRouting(baseRouterGroup, ginRouter)

	return r.Run(fmt.Sprintf("%s:%s", ae.Config.GetString("web.listen.host"), ae.Config.GetString("web.listen.port")))
}
