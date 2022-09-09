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
	Source      models.Source
}

func NewBaseClient(appConfig config.Interface, globalLogger logrus.FieldLogger, source models.Source, testHttpClient ...*http.Client) (*BaseClient, *models.Source, error) {
	var httpClient *http.Client
	var updatedSource *models.Source
	if len(testHttpClient) == 0 {
		//check if we need to refresh the access token
		//https://github.com/golang/oauth2/issues/84#issuecomment-520099526
		// https://chromium.googlesource.com/external/github.com/golang/oauth2/+/8f816d62a2652f705144857bbbcc26f2c166af9e/oauth2.go#239
		ctx := context.Background()
		conf := &oauth2.Config{
			ClientID:     source.ClientId,
			ClientSecret: "",
			Endpoint: oauth2.Endpoint{
				AuthURL:  fmt.Sprintf("%s/authorize", source.OauthEndpointBaseUrl),
				TokenURL: fmt.Sprintf("%s/token", source.OauthEndpointBaseUrl),
			},
			//RedirectURL:  "",
			//Scopes:       nil,
		}
		token := &oauth2.Token{
			TokenType:    "Bearer",
			RefreshToken: source.RefreshToken,
			AccessToken:  source.AccessToken,
			Expiry:       time.Unix(source.ExpiresAt, 0),
		}
		if token.Expiry.Before(time.Now()) { // expired so let's update it
			src := conf.TokenSource(ctx, token)
			newToken, err := src.Token() // this actually goes and renews the tokens
			if err != nil {
				return nil, nil, err
			}
			if newToken.AccessToken != token.AccessToken {
				token = newToken

				// update the "source" credential with new data (which will need to be sent
				updatedSource = &source
				updatedSource.AccessToken = newToken.AccessToken
				updatedSource.ExpiresAt = newToken.Expiry.Unix()
				// Don't overwrite `RefreshToken` with an empty value
				// if this was a token refreshing request.
				if newToken.RefreshToken != "" {
					updatedSource.RefreshToken = newToken.RefreshToken
				}

			}
		}

		// OLD CODE
		httpClient = oauth2.NewClient(ctx, oauth2.StaticTokenSource(token))

	} else {
		//Testing mode.
		httpClient = testHttpClient[0]
	}

	httpClient.Timeout = 10 * time.Second
	return &BaseClient{
		AppConfig:   appConfig,
		Logger:      globalLogger,
		OauthClient: httpClient,
		Source:      source,
	}, updatedSource, nil
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HttpClient
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
func (c *BaseClient) GetRequest(resourceSubpath string, decodeModelPtr interface{}) error {
	url := fmt.Sprintf("%s/%s", strings.TrimRight(c.Source.ApiEndpointBaseUrl, "/"), strings.TrimLeft(resourceSubpath, "/"))
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Helper Functions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
