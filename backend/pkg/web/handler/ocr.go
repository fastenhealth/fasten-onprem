package handler

import (
	"bytes"
	"encoding/json"
	"io"
	"mime/multipart"
	"net/http"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type MedicalReport struct {
	PatientName   string            `json:"patientName,omitempty"`
	DoctorName    string            `json:"doctorName,omitempty"`
	Hospital      string            `json:"hospital,omitempty"`
	Date          string            `json:"date,omitempty"`
	EncounterType *NHSEncounterType `json:"encounterType,omitempty"`
}

// OcrFileUploadHandler accepts a multipart/form-data upload and forwards it to the OCR service.
func OcrFileUploadHandler(c *gin.Context) {
	logger := logrus.New() // Standalone logger for this example

	// 1. Get the file from the incoming request.
	// "image" must match the name attribute of the file input field in the form.
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

	// Must close the multipart writer to write the final boundary.
	multipartWriter.Close()

	// 5. Create and send the request to the OCR service.
	ocrServiceURL := "http://ocr-service:8080/ocr"
	req, err := http.NewRequest("POST", ocrServiceURL, &requestBody)
	if err != nil {
		logger.Errorln("Error creating request to OCR service:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "internal server error"})
		return
	}
	// Set the Content-Type header with the correct multipart boundary.
	req.Header.Set("Content-Type", multipartWriter.FormDataContentType())

	// 6. Execute the request.
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		logger.Errorln("Error sending request to OCR service:", err)
		// Use StatusBadGateway to indicate an error with an upstream server.
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

	dateRe := regexp.MustCompile(`(?i)(\b\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}\b)`)
	if match := dateRe.FindStringSubmatch(ocrText); len(match) > 1 {
		result.Date = strings.TrimSpace(match[1])
	}

	// --- Encounter type detection ---
	result.EncounterType = extractEncounterTypeFromNHS(ocrText)

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
