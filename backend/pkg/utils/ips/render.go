package ips

import (
	"bytes"
	"embed"
	"encoding/json"
	"fmt"
	sprig "github.com/Masterminds/sprig/v3"
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models/database"
	"github.com/fastenhealth/gofhir-models/fhir401"
	"gorm.io/datatypes"
	"html/template"
	"math"
)

//go:embed templates
var ipsTemplates embed.FS

type Narrative struct {
	Templates *template.Template
}

// Ideally we'd do this with generics, however IntelliJ `gotype` type hints in Templates don't support generics correctly so we have this ugliness...
type NarrativeTemplateData struct {
	Bundle      *fhir401.Bundle
	Composition *fhir401.Composition

	Consent            []database.FhirConsent
	AllergyIntolerance []database.FhirAllergyIntolerance
	DiagnosticReport   []database.FhirDiagnosticReport
	//ClinicalImpression  *database.FhirClinicalImpression
	Procedure           []database.FhirProcedure
	Immunization        []database.FhirImmunization
	Device              []database.FhirDevice
	MedicationRequest   []database.FhirMedicationRequest
	MedicationStatement []database.FhirMedicationStatement
	Condition           []database.FhirCondition
	CarePlan            []database.FhirCarePlan
	Observation         []database.FhirObservation
	Encounter           []database.FhirEncounter
	Patient             database.FhirPatient
}

func NewNarrative() (*Narrative, error) {
	narrative := &Narrative{}

	//parse templates
	// https://stackoverflow.com/questions/50283370/include-template-from-another-directory
	// https://www.digitalocean.com/community/tutorials/how-to-use-templates-in-go
	tmpl, err := template.New("ips").Funcs(template.FuncMap{
		"safeHTMLPtr": func(s *string) template.HTML {
			if s == nil {
				return template.HTML("")
			}
			return template.HTML(*s)
		},
		"safeHTML": func(s string) template.HTML {
			return template.HTML(s)
		},
		"parseStringList": func(data datatypes.JSON) []string {
			var parsed []string
			_ = json.Unmarshal(data, &parsed)
			return parsed
		},
		"parseMapList": func(data datatypes.JSON) []map[string]interface{} {
			var parsed []map[string]interface{}
			_ = json.Unmarshal(data, &parsed)
			return parsed
		},
		"pluckList": func(key string, data []map[string]interface{}) []interface{} {
			values := []interface{}{}
			for _, item := range data {
				values = append(values, item[key])
			}
			return values
		},
		"roundList": func(precision uint, listVals []interface{}) []interface{} {
			results := []interface{}{}
			for ndx, _ := range listVals {
				switch listVal := listVals[ndx].(type) {
				case float64:
					ratio := math.Pow(10, float64(precision))
					results = append(results, math.Round(listVal*ratio)/ratio)
				default:
					results = append(results, listVal)
				}
			}
			return results
		},
	}).Funcs(sprig.FuncMap()).ParseFS(ipsTemplates, "templates/*.gohtml", "templates/includes/*.gohtml")

	if err != nil {
		return nil, err
	}
	narrative.Templates = tmpl
	return narrative, nil
}

func (r *Narrative) GetTemplates() *template.Template {
	return r.Templates
}

func (r *Narrative) RenderTemplate(templateName string, data NarrativeTemplateData) (string, error) {
	var b bytes.Buffer
	err := r.Templates.ExecuteTemplate(&b, templateName, data)
	if err != nil {
		return "", err
	}
	return b.String(), nil
}

func (r *Narrative) RenderSection(sectionType pkg.IPSSections, resources []database.IFhirResourceModel) (string, error) {
	templateName := fmt.Sprintf("%s.gohtml", sectionType)
	templateData := NarrativeTemplateData{
		Bundle:      &fhir401.Bundle{},
		Composition: &fhir401.Composition{},

		AllergyIntolerance:  []database.FhirAllergyIntolerance{},
		CarePlan:            []database.FhirCarePlan{},
		Condition:           []database.FhirCondition{},
		Consent:             []database.FhirConsent{},
		Device:              []database.FhirDevice{},
		DiagnosticReport:    []database.FhirDiagnosticReport{},
		Encounter:           []database.FhirEncounter{},
		Immunization:        []database.FhirImmunization{},
		MedicationRequest:   []database.FhirMedicationRequest{},
		MedicationStatement: []database.FhirMedicationStatement{},
		Observation:         []database.FhirObservation{},
		Procedure:           []database.FhirProcedure{},

		Patient: database.FhirPatient{},
	}

	//loop though the resources, cast them to the correct type, and then store them in the correct array
	//this is a bit of a hack, but it's the best way to do it without generics

	for ndx, _ := range resources {
		resource := resources[ndx]
		switch resource.GetSourceResourceType() {
		case "AllergyIntolerance":
			templateData.AllergyIntolerance = append(templateData.AllergyIntolerance, *resource.(*database.FhirAllergyIntolerance))
		case "CarePlan":
			templateData.CarePlan = append(templateData.CarePlan, *resource.(*database.FhirCarePlan))
		case "Condition":
			templateData.Condition = append(templateData.Condition, *resource.(*database.FhirCondition))
		case "Consent":
			templateData.Consent = append(templateData.Consent, *resource.(*database.FhirConsent))
		case "Device":
			templateData.Device = append(templateData.Device, *resource.(*database.FhirDevice))
		case "DiagnosticReport":
			templateData.DiagnosticReport = append(templateData.DiagnosticReport, *resource.(*database.FhirDiagnosticReport))
		case "Encounter":
			templateData.Encounter = append(templateData.Encounter, *resource.(*database.FhirEncounter))
		case "Immunization":
			templateData.Immunization = append(templateData.Immunization, *resource.(*database.FhirImmunization))
		case "MedicationRequest":
			templateData.MedicationRequest = append(templateData.MedicationRequest, *resource.(*database.FhirMedicationRequest))
		case "MedicationStatement":
			templateData.MedicationStatement = append(templateData.MedicationStatement, *resource.(*database.FhirMedicationStatement))
		case "Observation":
			templateData.Observation = append(templateData.Observation, *resource.(*database.FhirObservation))
		case "Procedure":
			templateData.Procedure = append(templateData.Procedure, *resource.(*database.FhirProcedure))
		}
	}

	var b bytes.Buffer
	err := r.Templates.ExecuteTemplate(&b, templateName, templateData)
	if err != nil {
		return "", err
	}
	return b.String(), nil
}
