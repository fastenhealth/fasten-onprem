package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// Medication represents a parsed medication with its dosage information
type Medication struct {
	Name   string `json:"name"`
	Dosage string `json:"dosage"`
}

// NlmMedicationIdentifier represents the identifier structure from NLM
type NlmMedicationIdentifier struct {
	System  string `json:"system"`
	Code    string `json:"code"`
	Display string `json:"display"`
}

// NlmMedication represents the structured medication data from NLM API
type NlmMedication struct {
	ID         string                    `json:"id"`
	Text       string                    `json:"text"`
	Identifier []NlmMedicationIdentifier `json:"identifier"`
}

// EnrichedMedication combines the extracted medication with NLM data
type EnrichedMedication struct {
	ExtractedName string         `json:"extracted_name"`
	Dosage        string         `json:"dosage"`
	NlmData       *NlmMedication `json:"nlm_data,omitempty"`
	SearchTerm    string         `json:"search_term"`
}
type MedicalReport struct {
	PatientName   string               `json:"patientName,omitempty"`
	DoctorName    string               `json:"doctorName,omitempty"`
	Hospital      string               `json:"hospital,omitempty"`
	Date          string               `json:"date,omitempty"`
	EncounterType *NHSEncounterType    `json:"encounterType,omitempty"`
	Medications   []EnrichedMedication `json:"medications,omitempty"` // New field for medications
}

// OcrFileUploadHandler accepts a multipart/form-data upload and forwards it to the OCR service.
func OcrFileUploadHandler(c *gin.Context) {
	logger := logrus.New() // Standalone logger for this example

	// 1. Get the file from the incoming request.
	fileHeader, err := c.FormFile("image")
	if err != nil {
		logger.Errorln("Error retrieving file from form:", err)
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "file 'image' is required"})
		return
	}

	// 2. Open the file to access its content.
	file, err := fileHeader.Open()
	if err != nil {
		logger.Errorln("Error opening uploaded file:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "could not process file"})
		return
	}
	defer file.Close()

	// 3. Create a new multipart request body in memory.
	var requestBody bytes.Buffer
	multipartWriter := multipart.NewWriter(&requestBody)

	// 4. Create a new form-file field in the new request and copy the file content into it.
	fileWriter, err := multipartWriter.CreateFormFile("image", fileHeader.Filename)
	if err != nil {
		logger.Errorln("Error creating form file for proxy request:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "internal server error"})
		return
	}
	if _, err := io.Copy(fileWriter, file); err != nil {
		logger.Errorln("Error copying file content for proxy request:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "internal server error"})
		return
	}

	multipartWriter.Close()

	// 5. Create and send the request to the OCR service.
	ocrServiceURL := "http://ocr-service:8080/ocr"
	req, err := http.NewRequest("POST", ocrServiceURL, &requestBody)
	if err != nil {
		logger.Errorln("Error creating request to OCR service:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "internal server error"})
		return
	}
	req.Header.Set("Content-Type", multipartWriter.FormDataContentType())

	// 6. Execute the request.
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		logger.Errorln("Error sending request to OCR service:", err)
		c.JSON(http.StatusBadGateway, gin.H{"success": false, "error": "ocr service is unavailable"})
		return
	}
	defer resp.Body.Close()

	// 7. Read the response from the OCR service.
	ocrResponseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		logger.Errorln("Error reading response from OCR service:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "failed to read OCR response"})
		return
	}

	// 8. Convert OCR response to string
	ocrText := string(ocrResponseBody)

	// 9. Extract structured medical report data
	jsonData, err := extractMedicalReportData(ocrText)
	if err != nil {
		logger.Errorln("Error extracting medical report data:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "failed to extract medical data"})
		return
	}

	// 10. Return structured JSON to the client
	c.Data(http.StatusOK, "application/json", jsonData)
}

// --- Helpers ---
func cleanText(text string) string {
	t := strings.TrimSpace(text)
	t = regexp.MustCompile(`^\s*[:\-]?\s*`).ReplaceAllString(t, "")
	t = regexp.MustCompile(`NRIC.*$`).ReplaceAllString(t, "")
	t = regexp.MustCompile(`\s{2,}`).ReplaceAllString(t, " ")
	return strings.TrimSpace(t)
}

func fallbackAfterKeyword(text string, keywordPattern string) string {
	lines := strings.Split(text, "\n")
	re := regexp.MustCompile(keywordPattern)

	for i, line := range lines {
		if re.MatchString(line) {
			parts := strings.SplitN(line, ":", 2)
			if len(parts) > 1 && strings.TrimSpace(parts[1]) != "" {
				return strings.TrimSpace(parts[1])
			}
			if i+1 < len(lines) && len(strings.TrimSpace(lines[i+1])) > 2 {
				return strings.TrimSpace(lines[i+1])
			}
		}
	}
	return ""
}

type NHSValueSetResponse struct {
	Expansion struct {
		Contains []NHSEncounterType `json:"contains"`
	} `json:"expansion"`
}

type NHSEncounterType struct {
	System      string `json:"system"`
	Code        string `json:"code"`
	Display     string `json:"display"`
	Designation []struct {
		Use struct {
			System string `json:"system"`
			Code   string `json:"code"`
		} `json:"use"`
		Value string `json:"value"`
	} `json:"designation"`
}

func FetchEncounterTypes() ([]NHSEncounterType, error) {
	url := "https://ontology.nhs.uk/production1/fhir/ValueSet/$expand?_format=json&filter=&url=http://hl7.org/fhir/ValueSet/service-type&incomplete-ok=true"
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var data NHSValueSetResponse
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, err
	}

	return data.Expansion.Contains, nil
}

func extractEncounterTypeFromNHS(ocrText string) *NHSEncounterType {
	types, err := FetchEncounterTypes()
	if err != nil {
		return nil
	}

	normalizedOCR := strings.ToUpper(strings.Join(strings.Fields(ocrText), " "))

	shorthandMap := map[string]string{
		"CT":   "COMPUTED TOMOGRAPHY",
		"XRAY": "X-RAY",
		"MRI":  "MAGNETIC RESONANCE IMAGING",
	}

	var bestMatch *NHSEncounterType
	bestLen := 0

	for _, eType := range types {
		// Prefer designation.value if available, else fallback to display
		label := eType.Display
		if len(eType.Designation) > 0 && eType.Designation[0].Value != "" {
			label = eType.Designation[0].Value
		}

		parts := strings.Split(label, "/")
		for _, part := range parts {
			p := strings.ToUpper(strings.TrimSpace(part))
			if p == "" {
				continue
			}

			match := false
			if strings.Contains(normalizedOCR, p) {
				match = true
			} else if fullName, ok := shorthandMap[p]; ok && strings.Contains(normalizedOCR, fullName) {
				match = true
			}

			if match && len(p) > bestLen {
				tmp := eType // copy to avoid referencing loop variable
				bestMatch = &tmp
				bestLen = len(p)
			}
		}
	}

	return bestMatch
}

// ExtractAndEnrichMedications is the main function that extracts medications from OCR text
// and enriches them with NLM API data
func ExtractAndEnrichMedications(ocrText string) ([]EnrichedMedication, error) {
	// Step 1: Extract medications from OCR text
	extractedMeds := ExtractMedications(ocrText)

	// Step 2: Enrich each medication with NLM data
	var enrichedMeds []EnrichedMedication

	for _, med := range extractedMeds {
		enriched := EnrichedMedication{
			ExtractedName: med.Name,
			Dosage:        med.Dosage,
			SearchTerm:    prepareSearchTerm(med.Name),
		}

		// Search NLM API for this medication
		nlmData, err := searchAndStructureMedication(enriched.SearchTerm)
		if err != nil {
			// Log error but continue processing other medications
			fmt.Printf("Error searching NLM for '%s': %v\n", enriched.SearchTerm, err)
		} else {
			enriched.NlmData = nlmData
		}

		enrichedMeds = append(enrichedMeds, enriched)
	}

	return enrichedMeds, nil
}

// ExtractMedications parses OCR text and extracts medication names and dosages
func ExtractMedications(ocrText string) []Medication {
	var medications []Medication

	// Normalize the text by removing extra whitespace and converting to lowercase for matching
	normalizedText := strings.ToLower(strings.TrimSpace(ocrText))

	// Find the medications section
	medicationsStart := findMedicationsSection(normalizedText)
	if medicationsStart == -1 {
		return medications
	}

	// Extract text from medications section until we hit another section or end
	medicationsText := extractMedicationsText(ocrText, medicationsStart)

	// Split into lines and process each potential medication line
	lines := strings.Split(medicationsText, "\n")

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		// Look for RX: pattern or medication-like patterns
		if med := parseMedicationLine(line); med.Name != "" {
			medications = append(medications, med)
		}
	}

	return medications
}

// prepareSearchTerm cleans the medication name for optimal NLM API searching
func prepareSearchTerm(medicationName string) string {
	// Remove common suffixes that might interfere with search
	searchTerm := medicationName

	// Remove dosage information if it somehow got included
	searchTerm = regexp.MustCompile(`\s+\d+(?:\.\d+)?\s*(?:mg|g|mcg|ug|ml|units?|iu).*$`).ReplaceAllString(searchTerm, "")

	// Clean up extra spaces
	searchTerm = regexp.MustCompile(`\s+`).ReplaceAllString(strings.TrimSpace(searchTerm), " ")

	return searchTerm
}

// searchAndStructureMedication queries the NLM API for a given medication name.
// It returns the first match as a structured NlmMedication object.
func searchAndStructureMedication(searchTerm string) (*NlmMedication, error) {
	baseURL := "https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search"
	req, err := http.NewRequest("GET", baseURL, nil)
	if err != nil {
		return nil, err
	}

	q := req.URL.Query()
	q.Add("ef", "SXDG_RXCUI,DISPLAY_NAME")
	q.Add("terms", searchTerm)
	req.URL.RawQuery = q.Encode()

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("NLM API returned status code %d", resp.StatusCode)
	}

	var nlmResponse []interface{}
	if err := json.NewDecoder(resp.Body).Decode(&nlmResponse); err != nil {
		return nil, err
	}

	if len(nlmResponse) < 3 {
		return nil, nil // No valid result found
	}

	dataMap, ok := nlmResponse[2].(map[string]interface{})
	if !ok {
		return nil, nil
	}

	rxcuiList, rxcuiOk := dataMap["SXDG_RXCUI"].([]interface{})
	displayNameList, nameOk := dataMap["DISPLAY_NAME"].([]interface{})

	// If we have at least one valid result, process and return the first one.
	if rxcuiOk && nameOk && len(rxcuiList) > 0 && len(displayNameList) > 0 {
		rxcui, rxcuiStrOk := rxcuiList[0].(string)
		displayName, nameStrOk := displayNameList[0].(string)

		if rxcuiStrOk && nameStrOk {
			medication := &NlmMedication{
				ID:   rxcui,
				Text: displayName,
				Identifier: []NlmMedicationIdentifier{
					{
						System:  "http://hl7.org/fhir/sid/rxnorm",
						Code:    rxcui,
						Display: displayName,
					},
				},
			}
			return medication, nil
		}
	}

	return nil, nil // Return nil, nil to indicate "not found"
}

// findMedicationsSection locates the start of the medications section
func findMedicationsSection(text string) int {
	patterns := []string{
		"medications",
		"rx:",
		"prescriptions",
		"current medications",
		"new prescriptions",
	}

	for _, pattern := range patterns {
		if idx := strings.Index(text, pattern); idx != -1 {
			return idx
		}
	}

	return -1
}

// extractMedicationsText extracts text from medications section until next major section
func extractMedicationsText(text string, start int) string {
	// Common section headers that would indicate end of medications section
	endPatterns := []string{
		"doctor",
		"clinic",
		"hospital",
		"diagnosis",
		"treatment plan",
		"follow-up",
		"notes",
		"allergies",
		"vital signs",
	}

	textFromStart := text[start:]

	// Find the earliest occurrence of any end pattern
	minEnd := len(textFromStart)
	for _, pattern := range endPatterns {
		if idx := strings.Index(strings.ToLower(textFromStart), pattern); idx != -1 && idx < minEnd {
			minEnd = idx
		}
	}

	return textFromStart[:minEnd]
}

// parseMedicationLine extracts medication name and dosage from a single line
func parseMedicationLine(line string) Medication {
	// Skip lines that are clearly not medications
	if isNonMedicationLine(line) {
		return Medication{}
	}

	// Remove common prefixes
	line = strings.TrimSpace(line)
	line = regexp.MustCompile(`^(rx:?\s*|medication:?\s*|\*\*rx:\*\*\s*)`).ReplaceAllString(strings.ToLower(line), "")
	line = strings.TrimSpace(line)

	if line == "" {
		return Medication{}
	}

	// Pattern to match medication name and dosage
	// Matches: "medication name dosage - instructions" or "medication name dosage instructions"
	patterns := []*regexp.Regexp{
		// Pattern 1: Name + dosage (number + mg/g/mcg/etc) + optional dash + instructions
		regexp.MustCompile(`^([a-zA-Z][a-zA-Z\-\s]+?)\s+(\d+(?:\.\d+)?\s*(?:mg|g|mcg|ug|ml|units?|iu)\b[^-]*?)(?:\s*-\s*(.+))?$`),

		// Pattern 2: Name + dosage without explicit units but with instructions containing "take"
		regexp.MustCompile(`^([a-zA-Z][a-zA-Z\-\s]+?)\s+(\d+(?:\.\d+)?(?:\s*mg|g|mcg|ug|ml|units?|iu)?)\s*(?:-\s*)?(.+take.+)$`),

		// Pattern 3: Just medication name with dosage info
		regexp.MustCompile(`^([a-zA-Z][a-zA-Z\-\s]+?)\s+(\d+(?:\.\d+)?\s*(?:mg|g|mcg|ug|ml|units?|iu))(.*)$`),
	}

	for _, pattern := range patterns {
		if matches := pattern.FindStringSubmatch(line); len(matches) >= 3 {
			name := strings.TrimSpace(matches[1])
			dosage := strings.TrimSpace(matches[2])

			// Clean up the name (remove extra spaces, fix capitalization)
			name = cleanMedicationName(name)

			// Clean up dosage
			dosage = strings.TrimSpace(dosage)

			if name != "" && dosage != "" {
				return Medication{
					Name:   name,
					Dosage: dosage,
				}
			}
		}
	}

	// Fallback: try to extract just the medication name if no clear dosage pattern
	if nameMatch := regexp.MustCompile(`^([a-zA-Z][a-zA-Z\-\s]{2,})`).FindStringSubmatch(line); len(nameMatch) >= 2 {
		name := cleanMedicationName(nameMatch[1])
		if name != "" && len(name) > 2 {
			// Try to find any dosage info in the rest of the line
			dosageMatch := regexp.MustCompile(`(\d+(?:\.\d+)?\s*(?:mg|g|mcg|ug|ml|units?|iu))`).FindString(line)

			return Medication{
				Name:   name,
				Dosage: dosageMatch,
			}
		}
	}

	return Medication{}
}

// isNonMedicationLine checks if a line is clearly not a medication
func isNonMedicationLine(line string) bool {
	lowerLine := strings.ToLower(strings.TrimSpace(line))

	// Skip empty lines or lines that are clearly headers/sections
	nonMedPatterns := []string{
		"medications",
		"prescriptions",
		"doctor",
		"clinic",
		"hospital",
		"contact",
		"phone",
		"address",
		"this section",
		"patient's current",
		"new prescriptions",
	}

	for _, pattern := range nonMedPatterns {
		if strings.Contains(lowerLine, pattern) {
			return true
		}
	}

	// Skip lines that are too short to be medications
	if len(lowerLine) < 3 {
		return true
	}

	// Skip lines that are just formatting (stars, dashes, etc.)
	if regexp.MustCompile(`^[\*\-=\s]+$`).MatchString(lowerLine) {
		return true
	}

	return false
}

// cleanMedicationName cleans and properly formats medication names
func cleanMedicationName(name string) string {
	// Remove extra whitespace
	name = regexp.MustCompile(`\s+`).ReplaceAllString(strings.TrimSpace(name), " ")

	// Capitalize first letter of each word (proper case for medication names)
	words := strings.Fields(name)
	for i, word := range words {
		if len(word) > 0 {
			words[i] = strings.ToUpper(word[:1]) + strings.ToLower(word[1:])
		}
	}

	return strings.Join(words, " ")
}

func extractMedicalReportData(ocrText string) ([]byte, error) {
	result := MedicalReport{}

	// --- Regex-based extraction ---
	patientRe := regexp.MustCompile(`(?i)(?:Full\s+name\s+of\s+patient|Patient\s*name|Patient)\s*:\s*([^\n\r]+)`)
	if match := patientRe.FindStringSubmatch(ocrText); len(match) > 1 {
		result.PatientName = cleanText(match[1])
	}

	doctorRe := regexp.MustCompile(`(?i)(?:Full\s+name\s+of\s+doctor|Doctor\s*name|Doctor)\s*:\s*([^\n\r]+)`)
	if match := doctorRe.FindStringSubmatch(ocrText); len(match) > 1 {
		result.DoctorName = cleanText(match[1])
	}

	hospitalRe := regexp.MustCompile(`(?i)(?:Hospital|Clinic)(?:\s*\/\s*Clinic)?(?:\s*name\s*and\s*address)?\s*:\s*([^\n\r]+)`)
	if match := hospitalRe.FindStringSubmatch(ocrText); len(match) > 1 {
		result.Hospital = cleanText(match[1])
	}

	// 1. Try labeled encounter date
	dateRe := regexp.MustCompile(`(?i)(?:Encounter\s+Date|Visit\s+Date|Date)\s*[:\-]?\s*(\b\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}\b)`)
	if match := dateRe.FindStringSubmatch(ocrText); len(match) > 1 {
		result.Date = strings.TrimSpace(match[1])
	} else {
		// 2. Remove DOBs
		dobRe := regexp.MustCompile(`(?i)\b(DOB|Date\s*of\s*Birth)\b\s*[:\-]?\s*\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}`)
		filteredText := dobRe.ReplaceAllString(ocrText, "")
		// 3. Take first remaining date
		generalDateRe := regexp.MustCompile(`(\b\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}\b)`)
		if match := generalDateRe.FindStringSubmatch(filteredText); len(match) > 1 {
			result.Date = strings.TrimSpace(match[1])
		}
	}

	// --- Encounter type detection ---
	result.EncounterType = extractEncounterTypeFromNHS(ocrText)

	// --- Medications extraction ---
	results, err := ExtractAndEnrichMedications(ocrText)
	if err != nil {
		return nil, err
	}
	result.Medications = results

	// --- Fallback heuristics ---
	if result.PatientName == "" {
		if fallback := fallbackAfterKeyword(ocrText, `(?i)\bPatient\b`); fallback != "" {
			result.PatientName = cleanText(fallback)
		}
	}
	if result.DoctorName == "" {
		if fallback := fallbackAfterKeyword(ocrText, `(?i)\bDoctor\b`); fallback != "" {
			result.DoctorName = cleanText(fallback)
		}
	}
	if result.Hospital == "" {
		if fallback := fallbackAfterKeyword(ocrText, `(?i)\b(Hospital|Clinic)\b`); fallback != "" {
			result.Hospital = cleanText(fallback)
		}
	}

	// Return JSON
	return json.MarshalIndent(result, "", "  ")
}
