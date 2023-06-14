//go:build exclude

package main

import (
	"encoding/json"
	"fmt"
	"github.com/dave/jennifer/jen"
	"github.com/iancoleman/strcase"
	"golang.org/x/exp/slices"
	"io/ioutil"
	"log"
	"strings"
)

type SearchParameter struct {
	Id           string   `json:"id"`
	Name         string   `json:"name"`
	Status       string   `json:"status"`
	Experimental bool     `json:"experimental"`
	Description  string   `json:"description"`
	Code         string   `json:"code"`
	Base         []string `json:"base"`
	Type         string   `json:"type"`
	XpathUsage   string   `json:"xpathUsage"`
	Expression   string   `json:"expression"`
	Target       []string `json:"target"`
}

type SearchParameterBundle struct {
	Entry []struct {
		Resource SearchParameter `json:"resource"`
	} `json:"entry"`
}

type DBField struct {
	FieldType          string
	Description        string
	FHIRPathExpression string
}

func main() {
	// Read the search-parameters.json file
	searchParamsData, err := ioutil.ReadFile("search-parameters.json")
	if err != nil {
		log.Fatal(err)
	}

	// Parse the search-parameters.json file
	var searchParamsBundle SearchParameterBundle
	err = json.Unmarshal(searchParamsData, &searchParamsBundle)
	if err != nil {
		log.Fatal(err)
	}

	resourceFieldMap := map[string]map[string]DBField{}

	// Generate Go structs for each resource type
	for _, entry := range searchParamsBundle.Entry {

		if entry.Resource.Status != "active" && entry.Resource.Status != "draft" {
			continue
		}
		if entry.Resource.Type == "composite" || entry.Resource.Type == "special" {
			continue
		}

		camelCaseResourceName := strcase.ToCamel(entry.Resource.Name)

		//log.Printf("processing %v", entry.Resource.Id)
		for _, resourceName := range entry.Resource.Base {

			if !slices.Contains(AllowedResources, resourceName) {
				continue
			}

			fieldMap, ok := resourceFieldMap[resourceName]
			if !ok {
				fieldMap = map[string]DBField{}
			}

			fieldMap[camelCaseResourceName] = DBField{
				FieldType:          entry.Resource.Type,
				Description:        entry.Resource.Description,
				FHIRPathExpression: entry.Resource.Expression,
			}

			resourceFieldMap[resourceName] = fieldMap
		}
	}

	//add default fields to all resources
	for resourceName, fieldMap := range resourceFieldMap {
		fieldMap["Id"] = DBField{
			FieldType:          "token",
			Description:        "Logical id of this artifact.",
			FHIRPathExpression: "Resource.id",
		}
		fieldMap["LastUpdated"] = DBField{
			FieldType:          "date",
			Description:        "When the resource version last changed",
			FHIRPathExpression: "Resource.meta.lastUpdated",
		}
		fieldMap["Language"] = DBField{
			FieldType:          "token",
			Description:        "Language of the resource content",
			FHIRPathExpression: "Resource.language",
		}
		fieldMap["Profile"] = DBField{
			FieldType:          "reference",
			Description:        "Profiles this resource claims to conform to",
			FHIRPathExpression: "Resource.meta.profile",
		}
		fieldMap["Source"] = DBField{
			FieldType:          "uri",
			Description:        "Identifies where the resource comes from",
			FHIRPathExpression: "Resource.meta.source",
		}
		fieldMap["Tag"] = DBField{
			FieldType:          "token",
			Description:        "Tags applied to this resource",
			FHIRPathExpression: "Resource.meta.tag",
		}
		fieldMap["Text"] = DBField{
			FieldType:   "string",
			Description: "Text search against the narrative",
		}
		fieldMap["Type"] = DBField{
			FieldType:   "special",
			Description: "A resource type filter",
		}

		fieldMap["RawResource"] = DBField{
			FieldType:   "special",
			Description: "The raw resource content in JSON format",
		}

		resourceFieldMap[resourceName] = fieldMap
	}

	// create files for each resource type
	for resourceName, fieldMap := range resourceFieldMap {

		file := jen.NewFile("database")

		// Generate struct declaration
		structName := "Fhir" + strings.Title(resourceName)
		file.Type().Id(structName).StructFunc(func(g *jen.Group) {
			// Generate fields for search parameters
			for fieldName, fieldInfo := range fieldMap {

				//TODO: sort keys alphabetically
				g.Comment(fieldInfo.Description)
				g.Comment(fmt.Sprintf("https://hl7.org/fhir/r4/search.html#%s", fieldInfo.FieldType))
				golangFieldType := mapFieldType(fieldInfo.FieldType)
				var golangFieldStatement *jen.Statement
				if strings.Contains(golangFieldType, "#") {
					golangFieldTypeParts := strings.Split(golangFieldType, "#")
					golangFieldStatement = g.Id(fieldName).Add(jen.Qual(golangFieldTypeParts[0], golangFieldTypeParts[1]))
				} else {
					golangFieldStatement = g.Id(fieldName).Add(jen.Id(golangFieldType))
				}
				golangFieldStatement.Tag(map[string]string{
					"json": fmt.Sprintf("%s,omitempty", strcase.ToLowerCamel(fieldName)),
					"gorm": fmt.Sprintf("column:%s", strcase.ToLowerCamel(fieldName)),
				})
			}
		})

		// Save the generated Go code to a file
		filename := fmt.Sprintf("%s.go", strcase.ToSnake(structName))
		fmt.Printf("Generated Go struct for %s: %s\n", structName, filename)
		err = file.Save(filename)
		if err != nil {
			log.Fatal(err)
		}

	}

	bytes, err := json.MarshalIndent(resourceFieldMap["Observation"], "", "    ")
	log.Printf("%s, %v", string(bytes), err)

	//TODO: create a migration function, used by the server, to create the tables in the database
	utilsFile := jen.NewFile("database")

	// Generate struct declaration
	utilsFile.Func().Id("Migrate").Params(
		jen.Id("gormClient").Op("*").Qual("gorm.io/gorm", "DB"),
	).Params(jen.Error()).BlockFunc(func(g *jen.Group) {

		/*
			err := sr.GormClient.AutoMigrate(
					&models.User{},
					&models.SourceCredential{},
					&models.ResourceFhir{},
					&models.Glossary{},
				)
				if err != nil {
					return fmt.Errorf("Failed to automigrate! - %v", err)
				}
				return nil
		*/
		g.Id("err").Op(":=").Id("gormClient").Dot("AutoMigrate").CallFunc(func(g *jen.Group) {
			for _, resourceName := range AllowedResources {
				g.Op("&").Id("Fhir" + resourceName).Values()
			}
		})

		g.If(jen.Id("err").Op("!=").Nil()).Values(jen.Return(jen.Id("err")))
		g.Return(jen.Nil())
	})

	// Save the generated Go code to a file
	err = utilsFile.Save("utils.go")
	if err != nil {
		log.Fatal(err)
	}

}

//TODO: should we do this, or allow all resources instead of just USCore?
//The dataabase would be full of empty data, but we'd be more flexible & future-proof.. supporting other countries, etc.
var AllowedResources = []string{
	"AdverseEvent",
	"AllergyIntolerance",
	"Appointment",
	"CarePlan",
	"CareTeam",
	"Claim",
	"ClaimResponse",
	"Condition",
	"Coverage",
	"CoverageEligibilityRequest",
	"CoverageEligibilityResponse",
	"Device",
	"DeviceRequest",
	"DiagnosticReport",
	"DocumentManifest",
	"DocumentReference",
	"Encounter",
	"Endpoint",
	"EnrollmentRequest",
	"EnrollmentResponse",
	"ExplanationOfBenefit",
	"FamilyMemberHistory",
	"Goal",
	"ImagingStudy",
	"Immunization",
	"InsurancePlan",
	"Location",
	"Media",
	"Medication",
	"MedicationAdministration",
	"MedicationDispense",
	"MedicationRequest",
	"MedicationStatement",
	"NutritionOrder",
	"Observation",
	"Organization",
	"OrganizationAffiliation",
	"Patient",
	"Person",
	"PractitionerRole",
	"Practitioner",
	"Procedure",
	"Provenance",
	"Questionnaire",
	"QuestionnaireResponse",
	"RelatedPerson",
	"ServiceRequest",
	"Specimen",
	"VisionPrescription",
}

//https://hl7.org/fhir/search.html#token
//https://hl7.org/fhir/r4/valueset-search-param-type.html
func mapFieldType(fieldType string) string {
	switch fieldType {
	case "number":
		return "float64"
	case "token":
		return "gorm.io/datatypes#JSON"
	case "reference":
		return "gorm.io/datatypes#JSON"
	case "date":
		return "time#Time"
	case "string":
		return "string"
	case "uri":
		return "string"
	case "special":
		return "gorm.io/datatypes#JSON"
	case "quantity":
		return "float64"
	default:
		return "string"
	}
}

//https://www.sqlite.org/datatype3.html
func mapGormType(fieldType string) string {
	// gorm:"type:text;serializer:json"

	switch fieldType {
	case "number":
		return "real"
	case "token":
		return "type:text;serializer:json"
	case "reference":
		return "type:text;serializer:json"
	case "date":
		return "type:datetime"
	case "string":
		return "type:text"
	case "uri":
		return "type:text"
	case "special":
		return "type:text;serializer:json"
	case "quantity":
		return "float64"
	default:
		return "string"
	}
}
