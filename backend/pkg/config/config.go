package config

import (
	"fmt"
	"github.com/analogj/go-util/utils"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/errors"
	"github.com/spf13/viper"
	"log"
	"os"
	"strings"
)

// When initializing this class the following methods must be called:
// Config.New
// Config.Init
// This is done automatically when created via the Factory.
type configuration struct {
	*viper.Viper
}

func (c *configuration) Init() error {
	c.Viper = viper.New()
	//set defaults
	c.SetDefault("web.listen.port", "8080")
	c.SetDefault("web.listen.host", "0.0.0.0")
	c.SetDefault("web.listen.basepath", "")
	c.SetDefault("web.listen.https.enabled", false)

	// allow unsafe endpoints should never be enabled in Production.
	// It enables direct API access to healthcare providers without authentication.
	c.SetDefault("web.allow_unsafe_endpoints", false)

	c.SetDefault("web.src.frontend.path", "/opt/fasten/web")
	c.SetDefault("database.type", "sqlite")
	c.SetDefault("database.location", "/opt/fasten/db/fasten.db")
	//c.SetDefault("database.encryption.key", "") //encryption key must be set by the user.
	c.SetDefault("cache.location", "/opt/fasten/cache/")

	c.SetDefault("jwt.issuer.key", "thisismysupersecuressessionsecretlength")

	c.SetDefault("log.level", "INFO")
	c.SetDefault("log.file", "")

	//set the default system config file search path.
	//if you want to load a non-standard location system config file (~/capsule.yml), use ReadConfig
	//if you want to load a repo specific config file, use ReadConfig
	c.SetConfigType("yaml")
	c.SetConfigName("template")
	c.AddConfigPath("$HOME/")

	//configure env variable parsing.
	c.SetEnvPrefix("FASTEN")
	c.SetEnvKeyReplacer(strings.NewReplacer("-", "_", ".", "_"))
	c.AutomaticEnv()
	//CLI options will be added via the `Set()` function

	return nil
}

func (c *configuration) ReadConfig(configFilePath string) error {

	if !utils.FileExists(configFilePath) {
		message := fmt.Sprintf("The configuration file (%s) could not be found. Skipping", configFilePath)
		log.Printf(message)
		return errors.ConfigFileMissingError("The configuration file could not be found.")
	}

	log.Printf("Loading configuration file: %s", configFilePath)

	config_data, err := os.Open(configFilePath)
	if err != nil {
		log.Printf("Error reading configuration file: %s", err)
		return err
	}
	err = c.MergeConfig(config_data)
	if err != nil {
		log.Printf("Error merging config file: %s", err)
		return err
	}
	return c.ValidateConfig()
}

// This function ensures that required configuration keys (that must be manually set) are present
func (c *configuration) ValidateConfig() error {
	if c.IsSet("database.encryption.key") {
		key := c.GetString("database.encryption.key")
		if key == "" {
			return errors.ConfigValidationError("database.encryption.key cannot be empty")
		}
		if len(key) < 10 {
			return errors.ConfigValidationError("database.encryption.key must be at least 10 characters")
		}
	}
	return nil
}
