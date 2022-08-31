package base

import (
	"fmt"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/fastenhealth/gofhir-models/fhir430"
	"github.com/sirupsen/logrus"
	"net/http"
)

type FHIR430Client struct {
	*BaseClient
}

func NewFHIR430Client(appConfig config.Interface, globalLogger logrus.FieldLogger, source models.Source, testHttpClient ...*http.Client) (*FHIR430Client, error) {
	return &FHIR430Client{
		NewBaseClient(appConfig, globalLogger, source, testHttpClient...),
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
