package base

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/sirupsen/logrus"
	"golang.org/x/oauth2"
	"net/http"
	"strings"
	"time"
)

type BaseClient struct {
	AppConfig config.Interface
	Logger    logrus.FieldLogger

	OauthClient *http.Client
	Credential  models.ProviderCredential
}

func NewBaseClient(appConfig config.Interface, globalLogger logrus.FieldLogger, credentials models.ProviderCredential, testHttpClient ...*http.Client) BaseClient {
	var httpClient *http.Client
	if len(testHttpClient) == 0 {
		httpClient = oauth2.NewClient(context.Background(), oauth2.StaticTokenSource(
			&oauth2.Token{
				TokenType:    "Bearer",
				RefreshToken: credentials.RefreshToken,
				AccessToken:  credentials.AccessToken,
			}))
	} else {
		//Testing mode.
		httpClient = testHttpClient[0]
	}

	httpClient.Timeout = 10 * time.Second
	return BaseClient{
		AppConfig:   appConfig,
		Logger:      globalLogger,
		OauthClient: httpClient,
		Credential:  credentials,
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HttpClient
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
func (c *BaseClient) GetRequest(resourceSubpath string, decodeModelPtr interface{}) error {
	url := fmt.Sprintf("%s/%s", strings.TrimRight(c.Credential.ApiEndpointBaseUrl, "/"), strings.TrimLeft(resourceSubpath, "/"))
	resp, err := c.OauthClient.Get(url)

	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 || resp.StatusCode < 200 {
		return fmt.Errorf("An error occurred during request - %d - %s", resp.StatusCode, resp.Status)
	}

	err = json.NewDecoder(resp.Body).Decode(decodeModelPtr)
	if err != nil {
		return err
	}
	return err
}
