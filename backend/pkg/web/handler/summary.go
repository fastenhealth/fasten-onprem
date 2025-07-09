package handler

import (
	"bytes"
	_ "embed"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/utils/ips"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func GetSummary(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	summary, err := databaseRepo.GetSummary(c)
	if err != nil {
		logger.Errorln("An error occurred while retrieving summary", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": summary})
}

func GetIPSSummary(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	ipsExport, err := databaseRepo.GetInternationalPatientSummaryExport(c)
	if err != nil {
		logger.Errorln("An error occurred while retrieving IPS summary", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}

	if c.Query("format") == "" {
		c.JSON(http.StatusOK, gin.H{"success": true, "data": ipsExport.Bundle})
		return
	}

	narrative, err := ips.NewNarrative()
	if err != nil {
		logger.Errorln("An error occurred while parsing template", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}

	composititon := ipsExport.Composition

	logger.Debugln("Rendering HTML")

	content, err := narrative.RenderTemplate("index.gohtml", ips.NarrativeTemplateData{Composition: composititon, Patient: *ipsExport.Patient})
	if err != nil {
		logger.Errorln("An error occurred while executing template", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}

	if c.Query("format") == "html" {

		c.Header("Content-Type", "text/html; charset=utf-8")
		c.Header("Content-Disposition", "attachment; filename=ips_summary.html")
		c.String(http.StatusOK, content)
		return
	} else if c.Query("format") == "pdf" {
		logger.Debugln("Converting to PDF")

		var requestBody bytes.Buffer

		multipartWriter := multipart.NewWriter(&requestBody)

		multipartWriter.WriteField("scale", "0.8")

		fileWriter, err := multipartWriter.CreateFormFile("file", "index.html")
		if err != nil {
			fmt.Println("Error creating form file:", err)
			return
		}

		_, err = io.WriteString(fileWriter, content)
		if err != nil {
			fmt.Println("Error writing to form file:", err)
			return
		}

		err = multipartWriter.Close()
		if err != nil {
			fmt.Println("Error closing multipart writer:", err)
			return
		}

		// Create a new HTTP request.
		req, err := http.NewRequest("POST", "http://localhost:3000/forms/chromium/convert/html", &requestBody)
		if err != nil {
			fmt.Println("Error creating request:", err)
			return
		}

		// Set the Content-Type header. This is crucial.
		// It includes the boundary string that the server needs to parse the body.
		req.Header.Set("Content-Type", multipartWriter.FormDataContentType())

		// Send the request.
		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			fmt.Println("Error sending request:", err)
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			logger.Errorf("PDF conversion failed with status: %s", resp.Status)
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to generate PDF summary."})
			return
		}

		c.Header("Content-Type", "application/pdf")
		c.Header("Content-Disposition", "attachment; filename=ips_summary.pdf")

		_, err = io.Copy(c.Writer, resp.Body)
		if err != nil {
			logger.Errorf("An error occurred while streaming the PDF response: %v", err)

		}
		
		return
	}
}
