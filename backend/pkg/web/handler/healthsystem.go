package handler

import (
	"fmt"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/gin-gonic/gin"
	"io/ioutil"
	"net/http"
	"net/url"
)

func HealthSystemRequest(c *gin.Context) {

	var healthSystemRequest models.RequestHealthSystem
	if err := c.ShouldBindJSON(&healthSystemRequest); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	//submit support request to Google Form
	//https://medium.com/front-end-augustus-study-notes/custom-google-form-en-f7be4c27a98b

	//source: https://docs.google.com/forms/d/e/1FAIpQLScH77CFpd3XAuwlUASFDJkOR54pZmt4AHqHa4xtZMGLXb1JIA/viewform?usp=sf_link
	formUrl := "https://docs.google.com/forms/u/0/d/e/1FAIpQLScH77CFpd3XAuwlUASFDJkOR54pZmt4AHqHa4xtZMGLXb1JIA/formResponse"

	supportRequestResponse, err := http.PostForm(formUrl, url.Values{
		"entry.583209151":  {healthSystemRequest.Email},
		"entry.1753315374": {healthSystemRequest.Name},
		"entry.1863832106": {healthSystemRequest.Website},
		"entry.751017705":  {healthSystemRequest.StreetAddress},
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
