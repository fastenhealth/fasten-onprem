package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/fastenhealth/gofhir-models/fhir401"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"log"
	"net"
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
		"http://hl7.org/fhir/sid/icd-10":               "2.16.840.1.113883.6.90",
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
		return "", fmt.Errorf("Code System not found: %s", codeSystem)
	}

}

// https://medlineplus.gov/medlineplus-connect/web-service/
// NOTE: max requests is 100/min
func GlossarySearchByCode(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	codeSystemId, err := FindCodeSystem(c.Query("code_system"))
	if err != nil {
		logger.Error(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}
	if c.Query("code") == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "code is required",
		})
		return
	}

	//Check if the code is in the DB cache
	foundGlossaryEntry, err := databaseRepo.GetGlossaryEntry(c, c.Query("code"), codeSystemId)
	if err == nil {
		//found in DB cache
		logger.Debugf("Found code (%s %s) in DB cache", c.Query("code"), codeSystemId)
		dateStr := foundGlossaryEntry.UpdatedAt.Format(time.RFC3339)
		valueSet := fhir401.ValueSet{
			Title:       &foundGlossaryEntry.Title,
			Url:         &foundGlossaryEntry.Url,
			Description: &foundGlossaryEntry.Description,
			Date:        &dateStr,
			Publisher:   &foundGlossaryEntry.Publisher,
		}

		c.JSON(http.StatusOK, valueSet)
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
	//TODO: when using IPV6 to communicate with MedlinePlus, we're getting timeouts. Force IPV4
	var (
		zeroDialer net.Dialer
		httpClient = &http.Client{
			Timeout: 10 * time.Second,
		}
	)
	transport := http.DefaultTransport.(*http.Transport).Clone()
	transport.DialContext = func(ctx context.Context, network, addr string) (net.Conn, error) {
		return zeroDialer.DialContext(ctx, "tcp4", addr)
	}
	httpClient.Transport = transport
	resp, err := httpClient.Get(medlinePlusConnectEndpoint + "?" + params.Encode())
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

		//store in DB cache (ignore errors)
		databaseRepo.CreateGlossaryEntry(c, &models.Glossary{
			ModelBase: models.ModelBase{
				CreatedAt: foundEntry.Updated.Value,
				UpdatedAt: foundEntry.Updated.Value,
			},
			Code:        c.Query("code"),
			CodeSystem:  codeSystemId,
			Publisher:   response.Feed.Author.Name.Value,
			Title:       foundEntry.Title.Value,
			Url:         foundEntry.Link[0].Href,
			Description: foundEntry.Summary.Value,
		})

		c.JSON(http.StatusOK, valueSet)
	}
}
