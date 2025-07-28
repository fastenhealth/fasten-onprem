package handler

import (
	"encoding/json"
	"net/http"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	sourceModels "github.com/fastenhealth/fasten-sources/clients/models"
	sourcePkg "github.com/fastenhealth/fasten-sources/pkg"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func CreatePractitioner(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	type CreatePractitionerRequest struct {
		Resource map[string]interface{} `json:"resource"`
	}

	var request CreatePractitionerRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "invalid request payload"})
		return
	}

	if resourceType, ok := request.Resource["resourceType"].(string); !ok || resourceType != "Practitioner" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "resource must be of type Practitioner"})
		return
	}

	currentUser, err := databaseRepo.GetCurrentUser(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "could not get current user"})
		return
	}

	practitionerSource := &models.SourceCredential{
		UserID:       currentUser.ID,
		PlatformType: sourcePkg.PlatformTypeManual,
		Patient:      "",
	}

	err = databaseRepo.CreateSource(c, practitionerSource)
	if err != nil {
		logger.Errorln("Error creating practitioner source:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "failed to create source"})
		return
	}

	resourceRaw, err := json.Marshal(request.Resource)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "failed to serialize resource"})
		return
	}

	resourceId, ok := request.Resource["id"].(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "practitioner must have an id field"})
		return
	}

	sortTitle := extractPractitionerSortTitle(request.Resource)

	resourceToUpsert := sourceModels.RawResourceFhir{
		SourceResourceType: "Practitioner",
		SourceResourceID:   resourceId,
		ResourceRaw:        resourceRaw,
		SortTitle:          &sortTitle,
	}

	createdResource, createError := databaseRepo.UpsertRawResource(c, practitionerSource, resourceToUpsert)
	if createError != nil {
		logger.Errorln("Error upserting practitioner:", createError)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "failed to create practitioner"})
		return
	}

	logger.Infof("Successfully created practitioner: %s with sort_title: %s", resourceId, sortTitle)
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "practitioner created successfully", "id": resourceId, "resource": createdResource})
}

func UpdatePractitioner(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	practitionerId := c.Param("practitionerId")
	if practitionerId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "practitioner ID is required"})
		return
	}

	type UpdatePractitionerRequest struct {
		Resource map[string]interface{} `json:"resource"`
	}

	var request UpdatePractitionerRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "invalid request payload"})
		return
	}

	if resourceType, ok := request.Resource["resourceType"].(string); !ok || resourceType != "Practitioner" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "resource must be of type Practitioner"})
		return
	}

	if resourceId, ok := request.Resource["id"].(string); !ok || resourceId != practitionerId {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "resource id must match URL parameter"})
		return
	}

	existingResource, err := databaseRepo.GetResourceByResourceTypeAndId(c, "Practitioner", practitionerId)
	if err != nil {
		logger.Errorln("Practitioner not found:", err)
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "practitioner not found"})
		return
	}

	sourceCredential, err := databaseRepo.GetSource(c, existingResource.SourceID.String())
	if err != nil {
		logger.Errorln("Error getting source credential:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "could not find source for practitioner"})
		return
	}

	resourceRaw, err := json.Marshal(request.Resource)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "failed to serialize resource"})
		return
	}

	sortTitle := extractPractitionerSortTitle(request.Resource)

	resourceToUpsert := sourceModels.RawResourceFhir{
		SourceResourceType: "Practitioner",
		SourceResourceID:   practitionerId,
		ResourceRaw:        resourceRaw,
		SortTitle:          &sortTitle,
	}

	updatedResource, updateError := databaseRepo.UpsertRawResource(c, sourceCredential, resourceToUpsert)
	if updateError != nil {
		logger.Errorln("Error updating practitioner:", updateError)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "failed to update practitioner"})
		return
	}

	logger.Infof("Successfully updated practitioner: %s with sort_title: %s", practitionerId, sortTitle)
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "practitioner updated successfully", "resource": updatedResource})
}

func extractPractitionerSortTitle(resource map[string]interface{}) string {

	if names, ok := resource["name"].([]interface{}); ok && len(names) > 0 {
		if nameObj, ok := names[0].(map[string]interface{}); ok {

			if text, ok := nameObj["text"].(string); ok && text != "" {
				return text
			}

			var family, given string
			if familyName, ok := nameObj["family"].(string); ok {
				family = familyName
			}
			if givenNames, ok := nameObj["given"].([]interface{}); ok && len(givenNames) > 0 {
				if givenName, ok := givenNames[0].(string); ok {
					given = givenName
				}
			}

			if family != "" && given != "" {
				return family + ", " + given
			} else if family != "" {
				return family
			}
		}
	}

	if name, ok := resource["name"].(string); ok && name != "" {
		return name
	}
	if fullName, ok := resource["full_name"].(string); ok && fullName != "" {
		return fullName
	}

	return ""
}
