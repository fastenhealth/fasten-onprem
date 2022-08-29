package base

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/fastenhealth/gofhir-models/fhir430"
	"github.com/sirupsen/logrus"
	"golang.org/x/oauth2"
	"net/http"
	"strings"
	"time"
)

type FHIR430Client struct {
	AppConfig config.Interface
	Logger    logrus.FieldLogger

	OauthClient *http.Client
	Credential  models.ProviderCredential
}

func NewFHIR430Client(appConfig config.Interface, globalLogger logrus.FieldLogger, credentials models.ProviderCredential, testHttpClient ...*http.Client) (FHIR430Client, error) {

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
	return FHIR430Client{
		AppConfig:   appConfig,
		Logger:      globalLogger,
		OauthClient: httpClient,
		Credential:  credentials,
	}, nil
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FHIR
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
func (c *FHIR430Client) GetPatientEverything(patientId string) (*fhir430.Bundle, error) {

	// https://www.hl7.org/fhir/patient-operation-everything.html
	bundle := fhir430.Bundle{}
	err := c.GetRequest(fmt.Sprintf("Patient/%s/$everything", patientId), &bundle)
	return &bundle, err
}

func (c *FHIR430Client) GetPatient(patientId string) (*fhir430.Patient, error) {

	patient := fhir430.Patient{}
	err := c.GetRequest(fmt.Sprintf("Patient/%s", patientId), &patient)
	return &patient, err

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HttpClient
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
func (c *FHIR430Client) GetRequest(resourceSubpath string, decodeModelPtr interface{}) error {
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
