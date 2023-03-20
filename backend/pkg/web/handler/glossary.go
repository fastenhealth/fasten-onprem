package handler

import (
	"encoding/json"
	"fmt"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/fastenhealth/gofhir-models/fhir401"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"
)

func FindCodeSystem(codeSystem string) (string, error) {
	log.Printf("codeSystem: %s", codeSystem)
	if strings.HasPrefix(codeSystem, "2.16.840.1.113883.6.") {
		return codeSystem, nil
	}

	//https://terminology.hl7.org/external_terminologies.html
	codeSystemIds := map[string]string{
		"http://hl7.org/fhir/sid/icd-10-cm":            "2.16.840.1.113883.6.90",
		"http://terminology.hl7.org/CodeSystem/icd9cm": "2.16.840.1.113883.6.103",
		"http://snomed.info/sct":                       "2.16.840.1.113883.6.96",
		"http://www.nlm.nih.gov/research/umls/rxnorm":  "2.16.840.1.113883.6.88",
		"http://hl7.org/fhir/sid/ndc":                  "2.16.840.1.113883.6.69",
		"http://loinc.org":                             "2.16.840.1.113883.6.1",
		"http://www.ama-assn.org/go/cpt":               "2.16.840.1.113883.6.12",
	}

	if codeSystemId, ok := codeSystemIds[codeSystem]; ok {
		return codeSystemId, nil
	} else {
		return "", fmt.Errorf("Code System not found")
	}

}

// https://medlineplus.gov/medlineplus-connect/web-service/
// NOTE: max requests is 100/min
func GlossarySearchByCode(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	//databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	codeSystemId, err := FindCodeSystem(c.Query("code_system"))
	if err != nil {
		logger.Error(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	// Define the URL for the MedlinePlus Connect Web Service API
	medlinePlusConnectEndpoint := "https://connect.medlineplus.gov/service"

	// Define the query parameters
	params := url.Values{
		"informationRecipient.languageCode.c": []string{"en"},
		"knowledgeResponseType":               []string{"application/json"},
		"mainSearchCriteria.v.c":              []string{c.Query("code")},
		"mainSearchCriteria.v.cs":             []string{codeSystemId},
	}

	// Send the HTTP GET request to the API and retrieve the response
	resp, err := http.Get(medlinePlusConnectEndpoint + "?" + params.Encode())
	if err != nil {
		fmt.Println("Error sending request:", err)
		return
	}
	defer resp.Body.Close()

	// Parse the JSON response into a struct
	var response models.MedlinePlusConnectResults
	err = json.NewDecoder(resp.Body).Decode(&response)
	if err != nil {
		fmt.Println("Error parsing response:", err)
		return
	}

	//store in DB cache

	//sourceCred, err := databaseRepo.GetSource(c, c.Param("sourceId"))
	//if err != nil {
	//	logger.Errorln("An error occurred while retrieving source credential", err)
	//	c.JSON(http.StatusInternalServerError, gin.H{"success": false})
	//	return
	//}

	if len(response.Feed.Entry) == 0 {
		c.JSON(http.StatusOK, gin.H{"success": false, "error": "No results found"})
		return
	} else {
		foundEntry := response.Feed.Entry[0]

		dateStr := foundEntry.Updated.Value.Format(time.RFC3339)
		valueSet := fhir401.ValueSet{
			Title:       &foundEntry.Title.Value,
			Url:         &foundEntry.Link[0].Href,
			Description: &foundEntry.Summary.Value,
			Date:        &dateStr,
			Publisher:   &response.Feed.Author.Name.Value,
		}

		c.JSON(http.StatusOK, valueSet)
	}
}
