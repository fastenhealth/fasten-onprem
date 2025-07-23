package handler

import (
	"bytes"
	"io"
	"mime/multipart"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

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
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "failed to read ocr response"})
		return
	}

	// 8. Proxy the response from the OCR service directly to the original client.
	// This forwards the status code, content-type, and body.
	c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), ocrResponseBody)
}
