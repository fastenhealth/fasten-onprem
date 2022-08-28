package base

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	gofhir "github.com/fastenhealth/gofhir-client/models"
	"github.com/sirupsen/logrus"
	"golang.org/x/oauth2"
	"net/http"
	"strings"
	"time"
)

type FhirBaseClient struct {
	AppConfig config.Interface
	Logger    logrus.FieldLogger

	OauthClient *http.Client
	Credential  models.ProviderCredential
}

func NewBaseClient(appConfig config.Interface, globalLogger logrus.FieldLogger, credentials models.ProviderCredential, testHttpClient ...*http.Client) (FhirBaseClient, error) {

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
	return FhirBaseClient{
		AppConfig:   appConfig,
		Logger:      globalLogger,
		OauthClient: httpClient,
		Credential:  credentials,
	}, nil
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FHIR
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
func (c *FhirBaseClient) GetPatientEverything(patientId string) (*gofhir.Bundle, error) {

	// https://www.hl7.org/fhir/patient-operation-everything.html
	data, err := c.GetRequest(fmt.Sprintf("Patient/%s/$everything", patientId))
	if err != nil {
		return nil, err
	}
	if bundle, isOk := data.(*gofhir.Bundle); isOk {
		return bundle, nil
	} else {
		return nil, errors.New("could not cast Patient")
	}
}

func (c *FhirBaseClient) GetPatient(patientId string) (*gofhir.Patient, error) {

	data, err := c.GetRequest(fmt.Sprintf("Patient/%s", patientId))
	if err != nil {
		return nil, err
	}
	if patient, isOk := data.(*gofhir.Patient); isOk {
		return patient, nil
	} else {
		return nil, errors.New("could not cast Patient")
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HttpClient
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
func (c *FhirBaseClient) GetRequest(resourceSubpath string) (interface{}, error) {
	url := fmt.Sprintf("%s/%s", strings.TrimRight(c.Credential.ApiEndpointBaseUrl, "/"), strings.TrimLeft(resourceSubpath, "/"))
	resp, err := c.OauthClient.Get(url)

	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	//log.Printf("%v resp code", resp.StatusCode)
	//body, err := ioutil.ReadAll(resp.Body)
	//log.Fatalf("JSON BODY: %v", string(body))

	var jsonResp map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&jsonResp)
	if err != nil {
		return nil, err
	}
	return gofhir.MapToResource(jsonResp, true)
}
