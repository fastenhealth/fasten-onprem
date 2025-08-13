package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"reflect"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	databaseModel "github.com/fastenhealth/fasten-onprem/backend/pkg/models/database"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// SyncData returns all FHIR resources for the authenticated user in a Bundle format
func SyncData(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	logger.Debug("Attempting to get current user for sync data")
	currentUser, err := databaseRepo.GetCurrentUser(c)
	if err != nil {
		logger.Errorf("Failed to get current user: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Unauthorized"})
		return
	}

	logger.Debugf("Successfully retrieved user: %s (ID: %s) for sync data", currentUser.Username, currentUser.ID)
	logger.Debug("Querying all resources for user")

	// Get all resources for the user
	allResources := make([]interface{}, 0)
	for _, resourceType := range databaseModel.GetAllowedResourceTypes() {
		resources, err := databaseRepo.QueryResources(c, models.QueryResource{
			From: resourceType,
		})
		if err != nil {
			logger.Errorf("Failed to get resources of type %s: %v", resourceType, err)
			continue // Continue with other resource types
		}

		if resources != nil {
			// Handle different resource types flexibly using reflection
			resourceValue := reflect.ValueOf(resources)
			if resourceValue.Kind() == reflect.Slice {
				for i := 0; i < resourceValue.Len(); i++ {
					resource := resourceValue.Index(i).Interface()
					allResources = append(allResources, resource)
				}
			}
		}
	}

	logger.Debugf("Successfully retrieved %d total resources", len(allResources))

	// Create FHIR Bundle structure
	bundle := models.FhirBundle{
		ResourceType: "Bundle",
		Type:         "collection",
		Total:        len(allResources),
		Entry:        make([]models.BundleEntry, len(allResources)),
	}

	for i, resource := range allResources {
		bundle.Entry[i] = models.BundleEntry{
			Resource: resource,
		}
	}

	// Debug output to console
	bundleBytes, _ := json.MarshalIndent(bundle, "", "  ")
	fmt.Println("--- BEGIN DEBUG BUNDLE ---")
	fmt.Printf("User: %s (ID: %s)\n", currentUser.Username, currentUser.ID)
	fmt.Printf("Total Resources: %d\n", len(allResources))
	fmt.Println(string(bundleBytes))
	fmt.Println("--- END DEBUG BUNDLE ---")

	// Return the bundle directly (not wrapped in success/data)
	c.JSON(http.StatusOK, bundle)
}
