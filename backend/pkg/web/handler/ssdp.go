package handler

import (
	"encoding/xml"
	"fmt"
	"net/http"
	"time"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/auth"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/config"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// DeviceDescription represents the UPnP device description XML
type DeviceDescription struct {
	XMLName     xml.Name `xml:"root"`
	SpecVersion SpecVersion `xml:"specVersion"`
	URLBase     string   `xml:"URLBase"`
	Device      Device   `xml:"device"`
}

// SpecVersion represents the UPnP specification version
type SpecVersion struct {
	Major int `xml:"major"`
	Minor int `xml:"minor"`
}

// Device represents the UPnP device information
type Device struct {
	DeviceType       string   `xml:"deviceType"`
	FriendlyName     string   `xml:"friendlyName"`
	Manufacturer     string   `xml:"manufacturer"`
	ManufacturerURL  string   `xml:"manufacturerURL"`
	ModelName        string   `xml:"modelName"`
	ModelNumber      string   `xml:"modelNumber"`
	ModelURL         string   `xml:"modelURL"`
	SerialNumber     string   `xml:"serialNumber"`
	UDN              string   `xml:"UDN"`
	Services         Services `xml:"serviceList"`
}

// Services represents the list of UPnP services
type Services struct {
	Service []Service `xml:"service"`
}

// Service represents a UPnP service
type Service struct {
	ServiceType string `xml:"serviceType"`
	ServiceID   string `xml:"serviceId"`
	SCPDURL     string `xml:"SCPDURL"`
	ControlURL  string `xml:"controlURL"`
	EventSubURL string `xml:"eventSubURL"`
}

// GetDeviceDescription returns the UPnP device description XML
func GetDeviceDescription(c *gin.Context) {
	appConfig := c.MustGet(pkg.ContextKeyTypeConfig).(config.Interface)

	// Get server address and port
	serverHost := c.GetHeader("X-Forwarded-Host")
	if serverHost == "" {
		serverHost = c.Request.Host
	}

	// Create device description
	deviceDesc := DeviceDescription{
		SpecVersion: SpecVersion{
			Major: 1,
			Minor: 1,
		},
		URLBase: fmt.Sprintf("http://%s", serverHost),
		Device: Device{
			DeviceType:      "urn:schemas-upnp-org:device:FastenHealth:1",
			FriendlyName:    appConfig.GetString("ssdp.name"),
			Manufacturer:    "Fasten Health",
			ManufacturerURL: "https://fastenhealth.com",
			ModelName:       "Fasten On-Prem",
			ModelNumber:     "1.0",
			ModelURL:        "https://github.com/fastenhealth/fasten-onprem",
			SerialNumber:    fmt.Sprintf("fasten-onprem-%d", time.Now().Unix()),
			UDN:             fmt.Sprintf("uuid:fasten-onprem-%s", appConfig.GetString("ssdp.name")),
			Services: Services{
				Service: []Service{
					{
						ServiceType: appConfig.GetString("ssdp.service"),
						ServiceID:   "urn:fastenhealth:serviceId:FastenHealth:1",
						SCPDURL:     "/api/ssdp/scpd.xml",
						ControlURL:  "/api/ssdp/control",
						EventSubURL: "/api/ssdp/events",
					},
				},
			},
		},
	}

	// Set XML content type
	c.Header("Content-Type", "application/xml")
	c.XML(http.StatusOK, deviceDesc)
}

// GetServiceDescription returns the UPnP service description XML
func GetServiceDescription(c *gin.Context) {
	// Create service description (simplified)
	serviceDesc := `<?xml version="1.0"?>
<scpd xmlns="urn:schemas-upnp-org:service-1-0">
  <specVersion>
    <major>1</major>
    <minor>0</minor>
  </specVersion>
  <actionList>
    <action>
      <name>GetSyncStatus</name>
      <argumentList>
        <argument>
          <name>Status</name>
          <direction>out</direction>
          <relatedStateVariable>Status</relatedStateVariable>
        </argument>
      </argumentList>
    </action>
  </actionList>
  <serviceStateTable>
    <stateVariable sendEvents="no">
      <name>Status</name>
      <dataType>string</dataType>
      <allowedValueList>
        <allowedValue>Active</allowedValue>
        <allowedValue>Inactive</allowedValue>
      </allowedValueList>
    </stateVariable>
  </serviceStateTable>
</scpd>`

	c.Header("Content-Type", "application/xml")
	c.Data(http.StatusOK, "application/xml", []byte(serviceDesc))
}

// GetSSDPStatus returns the current SSDP service status
func GetSSDPStatus(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	appConfig := c.MustGet(pkg.ContextKeyTypeConfig).(config.Interface)

	logger.Debug("Getting SSDP service status")

	// Get server address and port
	serverHost := c.GetHeader("X-Forwarded-Host")
	if serverHost == "" {
		serverHost = c.Request.Host
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"service": "SSDP/UPnP",
			"status":  "active",
			"device": gin.H{
				"name":        appConfig.GetString("ssdp.name"),
				"type":        appConfig.GetString("ssdp.service"),
				"location":    fmt.Sprintf("http://%s%s", serverHost, appConfig.GetString("ssdp.location")),
				"friendly_name": "Fasten Health On-Premises Server",
			},
			"capabilities": []string{
				"service_discovery",
				"health_data_sync",
				"fhir_integration",
			},
			"endpoints": gin.H{
				"device_description": fmt.Sprintf("http://%s%s", serverHost, appConfig.GetString("ssdp.location")),
				"service_description": fmt.Sprintf("http://%s/api/ssdp/scpd.xml", serverHost),
				"sync_status": fmt.Sprintf("http://%s/api/secure/sync/status", serverHost),
			},
		},
	})
}



// MobileSync handles mobile app sync requests
// Returns a JWT token for an existing user with FHIR data
func MobileSync(c *gin.Context) {
	log := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)
	appConfig := c.MustGet(pkg.ContextKeyTypeConfig).(config.Interface)

	log.Debug("Mobile sync request received via SSDP")

	// Find an existing user with FHIR data (use testuser who has 23 observations)
	existingUser, err := databaseRepo.GetUserByUsername(c, "testuser")
	if err != nil {
		log.Errorf("Failed to get existing user with data: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get user with data"})
		return
	}
	
	log.Debugf("Using existing user: %s (ID: %s) for mobile sync", existingUser.Username, existingUser.ID)
	
	// Generate a proper JWT token using the existing auth function (1 hour expiry)
	userToken, err := auth.JwtGenerateFastenTokenFromUser(*existingUser, appConfig.GetString("jwt.issuer.key"))
	if err != nil {
		log.Errorf("Failed to generate user token: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	log.Debug("Successfully generated JWT token for existing user")
	
	// Get server info for mobile app
	serverHost := c.GetHeader("X-Forwarded-Host")
	if serverHost == "" {
		serverHost = c.Request.Host
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"token":   userToken,
			"server":  serverHost,
			"service": "Fasten Health Server",
			"version": "1.0.0",
			"endpoints": gin.H{
				"fhir_data": "/api/secure/sync/data",
				"health":     "/api/health",
			},
			"expiresAt": time.Now().Add(1 * time.Hour).Format(time.RFC3339),
			"tokenType": "jwt",
			"username":  existingUser.Username,
		},
	})
}
