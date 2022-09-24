package base

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/database"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/sirupsen/logrus"
	"golang.org/x/oauth2"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

type BaseClient struct {
	Context   context.Context
	AppConfig config.Interface
	Logger    logrus.FieldLogger

	OauthClient *http.Client
	Source      models.Source
	Headers     map[string]string
}

func (c *BaseClient) SyncAllBundle(db database.DatabaseRepository, bundleFile *os.File) error {
	panic("SyncAllBundle functionality is not available on this client")
}

func NewBaseClient(ctx context.Context, appConfig config.Interface, globalLogger logrus.FieldLogger, source models.Source, testHttpClient ...*http.Client) (*BaseClient, *models.Source, error) {
	var httpClient *http.Client
	var updatedSource *models.Source
	if len(testHttpClient) == 0 {
		//check if we need to refresh the access token
		//https://github.com/golang/oauth2/issues/84#issuecomment-520099526
		// https://chromium.googlesource.com/external/github.com/golang/oauth2/+/8f816d62a2652f705144857bbbcc26f2c166af9e/oauth2.go#239
		conf := &oauth2.Config{
			ClientID:     source.ClientId,
			ClientSecret: "",
			Endpoint: oauth2.Endpoint{
				AuthURL:  source.OauthAuthorizationEndpoint,
				TokenURL: source.OauthTokenEndpoint,
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
			log.Println("access token expired, refreshing...")
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
		Context:     ctx,
		AppConfig:   appConfig,
		Logger:      globalLogger,
		OauthClient: httpClient,
		Source:      source,
		Headers:     map[string]string{},
	}, updatedSource, nil
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HttpClient
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
func (c *BaseClient) GetRequest(resourceSubpathOrNext string, decodeModelPtr interface{}) error {
	resourceUrl, err := url.Parse(resourceSubpathOrNext)
	if err != nil {
		return err
	}
	if !resourceUrl.IsAbs() {
		resourceUrl, err = url.Parse(fmt.Sprintf("%s/%s", strings.TrimRight(c.Source.ApiEndpointBaseUrl, "/"), strings.TrimLeft(resourceSubpathOrNext, "/")))
	}
	if err != nil {
		return err
	}

	req, err := http.NewRequest(http.MethodGet, resourceUrl.String(), nil)
	if err != nil {
		return err
	}

	for key, val := range c.Headers {
		//req.Header.Add("Accept", "application/json+fhir")
		req.Header.Add(key, val)
	}

	//resp, err := c.OauthClient.Get(url)
	resp, err := c.OauthClient.Do(req)

	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 || resp.StatusCode < 200 {
		b, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("An error occurred during request %s - %d - %s [%s]", resourceUrl, resp.StatusCode, resp.Status, string(b))
	}

	err = ParseBundle(resp.Body, decodeModelPtr)
	return err
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Helper Functions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
func ParseBundle(r io.Reader, decodeModelPtr interface{}) error {
	decoder := json.NewDecoder(r)
	//decoder.DisallowUnknownFields() //make sure we throw an error if unknown fields are present.
	err := decoder.Decode(decodeModelPtr)
	if err != nil {
		return err
	}
	return err
}
