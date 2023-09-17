package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"time"

	"github.com/analogj/go-util/utils"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/config"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/errors"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/version"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/web"
	"github.com/sirupsen/logrus"
	"github.com/urfave/cli/v2"
)

var goos string
var goarch string

func main() {

	appconfig, err := config.Create()
	if err != nil {
		fmt.Printf("FATAL: %+v\n", err)
		os.Exit(1)
	}

	//we're going to load the config file manually, since we need to validate it.
	// err = appconfig.ReadConfig("config.yaml")             // Find and read the config file
	err = appconfig.ReadConfig("config.dev.yaml")
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
					// fmt.Fprintln(c.App.Writer, c.Command.Usage)

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

					settingsData, err := json.Marshal(appconfig.AllSettings())
					appLogger.Debug(string(settingsData), err)

					webServer := web.AppEngine{Config: appconfig, Logger: appLogger}
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
		},
	}

	err = app.Run(os.Args)
	if err != nil {
		log.Fatalf("ERROR: %v", err)
	}
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
