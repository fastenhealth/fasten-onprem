package handler

import (
	"fmt"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/gin-gonic/gin"
	"io/ioutil"
	"net/http"
	"net/url"
)

func SupportRequest(c *gin.Context) {

	var supportRequest models.SupportRequest
	if err := c.ShouldBindJSON(&supportRequest); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	//submit support request to Google Form
	//https://medium.com/front-end-augustus-study-notes/custom-google-form-en-f7be4c27a98b

	//source: https://docs.google.com/forms/d/e/1FAIpQLSfFxttuzE4mYNtQxa2XxsHw3uyNsxUzE-BeYF4JXxoKku3R5A/viewform
	formUrl := "https://docs.google.com/forms/u/0/d/e/1FAIpQLSfFxttuzE4mYNtQxa2XxsHw3uyNsxUzE-BeYF4JXxoKku3R5A/formResponse"

	supportRequestResponse, err := http.PostForm(formUrl, url.Values{
		"entry.1688458216": {supportRequest.FullName},
		"entry.153181769":  {supportRequest.Email},
		"entry.1194157548": {supportRequest.RequestContent},
		"entry.108410483":  {supportRequest.CurrentPage},
		"entry.1640090028": {supportRequest.DistType},
		"entry.882116507":  {supportRequest.Flavor},
		"entry.1331679697": {supportRequest.Version},
		"entry.164864077":  {supportRequest.Arch},
		"entry.1469583108": {supportRequest.Os},
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	defer supportRequestResponse.Body.Close()
	body, err := ioutil.ReadAll(supportRequestResponse.Body)

	if err != nil {
		//handle read response error
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	} else if supportRequestResponse.StatusCode != 200 {
		//handle non 200 response
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": fmt.Sprintf("status code error: %d %s", supportRequestResponse.StatusCode, supportRequestResponse.Status)})
		return
	}

	fmt.Printf("%s\n", string(body))

	c.JSON(http.StatusOK, gin.H{"success": true})
}
