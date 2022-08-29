package base

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/fastenhealth/gofhir-models/fhir401"
	"github.com/sirupsen/logrus"
	"golang.org/x/oauth2"
	"net/http"
	"strings"
	"time"
)

type FHIR401Client struct {
	AppConfig config.Interface
	Logger    logrus.FieldLogger

	OauthClient *http.Client
	Credential  models.ProviderCredential
}

func NewFHIR401Client(appConfig config.Interface, globalLogger logrus.FieldLogger, credentials models.ProviderCredential, testHttpClient ...*http.Client) (FHIR401Client, error) {

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
	return FHIR401Client{
		AppConfig:   appConfig,
		Logger:      globalLogger,
		OauthClient: httpClient,
		Credential:  credentials,
	}, nil
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FHIR
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
func (c *FHIR401Client) GetPatientEverything(patientId string) (*fhir401.Bundle, error) {

	// https://www.hl7.org/fhir/patient-operation-everything.html
	bundle := fhir401.Bundle{}
	err := c.GetRequest(fmt.Sprintf("Patient/%s/$everything", patientId), &bundle)
	return &bundle, err

}

func (c *FHIR401Client) GetPatient(patientId string) (*fhir401.Patient, error) {

	patient := fhir401.Patient{}
	err := c.GetRequest(fmt.Sprintf("Patient/%s", patientId), &patient)
	return &patient, err
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HttpClient
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
func (c *FHIR401Client) GetRequest(resourceSubpath string, decodeModelPtr interface{}) error {
	url := fmt.Sprintf("%s/%s", strings.TrimRight(c.Credential.ApiEndpointBaseUrl, "/"), strings.TrimLeft(resourceSubpath, "/"))
	resp, err := c.OauthClient.Get(url)

	if err != nil {
		return err
	}
	defer resp.Body.Close()

	err = json.NewDecoder(resp.Body).Decode(decodeModelPtr)
	if err != nil {
		return err
	}
	return err
}
