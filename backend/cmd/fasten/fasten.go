package main

import (
	"encoding/json"
	"fmt"
	"github.com/analogj/go-util/utils"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/config"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/errors"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/event_bus"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/version"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/web"
	"github.com/fastenhealth/fasten-onprem/backend/resources"
	"github.com/sirupsen/logrus"
	"github.com/urfave/cli/v2"
	"github.com/grandcat/zeroconf"
	"io"
	"log"
	"net"
	"os"
	"time"
)

var goos string
var goarch string

func main() {
	log.Print("Starting fasten-onprem")
	defer log.Print("Finished fasten-onprem")
	appconfig, err := config.Create()
	if err != nil {
		fmt.Printf("FATAL: %+v\n", err)
		os.Exit(1)
	}

	//we're going to load the config file manually, since we need to validate it.
	err = appconfig.ReadConfig("config.yaml")             // Find and read the config file
	if _, ok := err.(errors.ConfigFileMissingError); ok { // Handle errors reading the config file
		//ignore "could not find config file"
	} else if err != nil {
		os.Exit(1)
	}

	app := &cli.App{
		Name:     "goweb",
		Usage:    "Example go web application",
		Version:  version.VERSION,
		Compiled: time.Now(),
		Authors: []*cli.Author{
			{
				Name:  "Jason Kulatunga",
				Email: "jason@thesparktree.com",
			},
		},
		Before: func(c *cli.Context) error {

			packagrUrl := "github.com/fastenhealth/fasten-onprem"

			versionInfo := fmt.Sprintf("%s.%s-%s", goos, goarch, version.VERSION)

			subtitle := packagrUrl + utils.LeftPad2Len(versionInfo, " ", 53-len(packagrUrl))

			fmt.Fprintf(c.App.Writer, fmt.Sprintf(utils.StripIndent(
				`
			  o888o                       o8                          
			o888oo ooooooo    oooooooo8 o888oo ooooooooo8 oo oooooo   
			 888   ooooo888  888ooooooo  888  888oooooo8   888   888  
			 888 888    888          888 888  888          888   888  
			o888o 88ooo88 8o 88oooooo88   888o  88oooo888 o888o o888o
			%s

			`), subtitle))
			return nil
		},

		Commands: []*cli.Command{
			{
				Name:  "start",
				Usage: "Start the fasten server",
				Action: func(c *cli.Context) error {
					//fmt.Fprintln(c.App.Writer, c.Command.Usage)
					if c.IsSet("config") {
						err = appconfig.ReadConfig(c.String("config")) // Find and read the config file
						if err != nil {                                // Handle errors reading the config file
							//ignore "could not find config file"
							fmt.Printf("Could not find config file at specified path: %s", c.String("config"))
							return err
						}
					}

					//process cli variables
					if c.IsSet("variable") {
						appconfig.Set("variable", c.String("variable"))
					}
					if c.Bool("debug") {
						appconfig.Set("log.level", "DEBUG")
					}
					if c.IsSet("log-file") {
						appconfig.Set("log.file", c.String("log-file"))
					}

					appLogger, logFile, err := CreateLogger(appconfig)
					if logFile != nil {
						defer logFile.Close()
					}
					if err != nil {
						return err
					}

					// ensure panics are written to the log file.
					defer func() {
						if err := recover(); err != nil {
							appLogger.Panic("panic occurred:", err)
						}
					}()

					settingsData, err := json.Marshal(appconfig.AllSettings())
					appLogger.Debug(string(settingsData), err)

					//zeroconf
					zeroconfServer, err := startZeroconfServer(appLogger, appconfig)
					if err != nil {
						//non-fatal error, so we'll just log it
						appLogger.Warn(err)
					}
					if zeroconfServer != nil {
						defer zeroconfServer.Shutdown()
					}

					relatedVersions, _ := resources.GetRelatedVersions()

					webServer := web.AppEngine{
						Config:          appconfig,
						Logger:          appLogger,
						EventBus:        event_bus.NewEventBusServer(appLogger),
						RelatedVersions: relatedVersions,
					}
					return webServer.Start()
				},

				Flags: []cli.Flag{
					&cli.StringFlag{
						Name:  "config",
						Usage: "Specify the path to the config file",
					},
					&cli.StringFlag{
						Name:  "variable",
						Value: "default",
						Usage: "The variable used by webserver",
					},
					&cli.StringFlag{
						Name:  "log-file",
						Usage: "Path to file for logging. Leave empty to use STDOUT",
						Value: "",
					},
					&cli.BoolFlag{
						Name:    "debug",
						Usage:   "Enable debug logging",
						EnvVars: []string{"DEBUG"},
					},
				},
			},
			{
				Name:  "version",
				Usage: "Print the version",
				Action: func(c *cli.Context) error {
					fmt.Println(version.VERSION)
					return nil
				},
			},
			{
				Name:  "migrate",
				Usage: "Run database migrations, without starting application",
				Action: func(c *cli.Context) error {

					if c.IsSet("config") {
						err = appconfig.ReadConfig(c.String("config")) // Find and read the config file
						if err != nil {                                // Handle errors reading the config file
							//ignore "could not find config file"
							fmt.Printf("Could not find config file at specified path: %s", c.String("config"))
							return err
						}
					}

					if c.Bool("debug") {
						appconfig.Set("log.level", "DEBUG")
					}

					appLogger, logFile, err := CreateLogger(appconfig)
					if logFile != nil {
						defer logFile.Close()
					}
					if err != nil {
						return err
					}

					// ensure panics are written to the log file.
					defer func() {
						if err := recover(); err != nil {
							appLogger.Panic("panic occurred:", err)
						}
					}()

					_, err = database.NewRepository(appconfig, appLogger, event_bus.NewNoopEventBusServer())
					return err
				},
				Flags: []cli.Flag{
					&cli.StringFlag{
						Name:  "config",
						Usage: "Specify the path to the config file",
					},
					&cli.BoolFlag{
						Name:    "debug",
						Usage:   "Enable debug logging",
						EnvVars: []string{"DEBUG"},
					},
				},
			},
		},
	}

	err = app.Run(os.Args)
	if err != nil {
		log.Fatalf("ERROR: %v", err)
	}
}

func startZeroconfServer(logger *logrus.Entry, cfg config.Interface) (*zeroconf.Server, error) {
	if !cfg.GetBool("mdns.enabled") {
		logger.Info("mDNS service is disabled by config.")
		return nil, nil
	}

	logger.Info("Registering mDNS service...")

	txtRecords := []string{fmt.Sprintf("version=%s", version.VERSION)}

	var ifaces []net.Interface
	if cfg.IsSet("mdns.interfaces") {
		interfaces := cfg.GetStringSlice("mdns.interfaces")
		if len(interfaces) > 0 {
			ifaces = make([]net.Interface, len(interfaces))
			for i, ifaceName := range interfaces {
				iface, err := net.InterfaceByName(ifaceName)
				if err != nil {
					return nil, fmt.Errorf("mDNS service registration failed: could not find interface %s", ifaceName)
				}
				ifaces[i] = *iface
			}
			logger.Infof("mDNS service will listen on the following interfaces: %v", interfaces)
		} else {
			logger.Info("mDNS service will listen on all available interfaces, as none were specified in the config.")
		}
	} else {
		logger.Info("mDNS service will listen on all available interfaces, as none were specified in the config.")
	}

	server, err := zeroconf.Register(
		cfg.GetString("mdns.name"),
		cfg.GetString("mdns.service"),
		cfg.GetString("mdns.domain"),
		cfg.GetInt("web.listen.port"),
		txtRecords,
		ifaces,
	)

	if err != nil {
		return nil, fmt.Errorf("mDNS service registration failed: %v. The application will continue without network discovery", err)
	}

	logger.Info("mDNS service registered successfully.")
	return server, nil
}

func CreateLogger(appConfig config.Interface) (*logrus.Entry, *os.File, error) {
	logger := logrus.WithFields(logrus.Fields{
		"type": "web",
	})
	//set default log level
	if level, err := logrus.ParseLevel(appConfig.GetString("log.level")); err == nil {
		logger.Logger.SetLevel(level)
	} else {
		logger.Logger.SetLevel(logrus.InfoLevel)
	}

	var logFile *os.File
	var err error
	if appConfig.IsSet("log.file") && len(appConfig.GetString("log.file")) > 0 {
		logFile, err = os.OpenFile(appConfig.GetString("log.file"), os.O_CREATE|os.O_WRONLY, 0644)
		if err != nil {
			logger.Logger.Errorf("Failed to open log file %s for output: %s", appConfig.GetString("log.file"), err)
			return nil, logFile, err
		}
		logger.Logger.SetOutput(io.MultiWriter(os.Stderr, logFile))
	}
	return logger, logFile, nil
}
