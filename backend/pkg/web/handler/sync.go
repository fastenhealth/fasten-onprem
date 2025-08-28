package handler

import (
	"net"
	"net/http"
	"os"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/config"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// GetServerDiscovery returns minimal server connection information for mobile apps
func GetServerDiscovery(c *gin.Context) {
	appConfig := c.MustGet(pkg.ContextKeyTypeConfig).(config.Interface)

	serverBaseURLs := GetServerBaseURLs(c, appConfig)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"server_base_urls": serverBaseURLs,
			"sync_endpoint":    "api/secure/resource/fhir",
		},
	})
}

// GetServerBaseURLs returns multiple possible server base URLs for network change resilience
func GetServerBaseURLs(c *gin.Context, appConfig config.Interface) []string {
	log := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)

	// Determine the port to use
	port := appConfig.GetString("web.listen.port") // Default to internal port
	if hostPort := os.Getenv("HOST_PORT"); hostPort != "" {
		port = hostPort
	}

	var serverBaseURLs []string

	protocol := "http"
	if appConfig.GetBool("web.listen.https.enabled") {
		protocol = "https"
	}

	// Helper to add a connection string
	addBaseURL := func(host, p string) {
		serverBaseURLs = append(serverBaseURLs, protocol+"://"+net.JoinHostPort(host, p))
	}

	// Priority 0: use mDNS hostname
	hostname, err := os.Hostname()
	if err != nil {
		log.Errorf("Failed to get hostname: %v", err)
		// Continue without hostname if there's an error, or handle as appropriate
	} else {
		addBaseURL(hostname, port)
	}

	// Priority 1: Environment variable override
	if envHost := os.Getenv("HOST_IP"); envHost != "" {
		addBaseURL(envHost, port)
	}

	// Priority 2: All local network interface IPs
	ifaces, err := net.Interfaces()
	if err != nil {
		log.Errorf("Failed to get network interfaces: %v", err)
	} else {
		for _, i := range ifaces {
			addrs, err := i.Addrs()
			if err != nil {
				log.Errorf("Failed to get addresses for interface %s: %v", i.Name, err)
				continue
			}
			for _, addr := range addrs {
				var ip net.IP
				switch v := addr.(type) {
				case *net.IPNet:
					ip = v.IP
				case *net.IPAddr:
					ip = v.IP
				}
				if ip == nil || ip.IsLoopback() {
					continue
				}
				ip = ip.To4()
				if ip == nil {
					continue // not an ipv4 address
				}
				addBaseURL(ip.String(), port)
			}
		}
	}

	// Priority 3: Headers from reverse proxies
	// X-Forwarded-Host can contain a host:port pair or just a host.
	// We attempt to split it, but if it fails, we use the whole string as the host.
	if forwardedHost := c.GetHeader("X-Forwarded-Host"); forwardedHost != "" {
		host, p, err := net.SplitHostPort(forwardedHost)
		if err != nil {
			host = forwardedHost // If splitting fails, use the whole string as host
			p = port             // Use default port if not specified in header
		}
		addBaseURL(host, p)
	}
	if realIP := c.GetHeader("X-Real-IP"); realIP != "" {
		addBaseURL(realIP, port)
	}

	return uniqueServerBaseURLs(serverBaseURLs)
}

// uniqueServerBaseURLs removes duplicate connection strings while preserving order.
func uniqueServerBaseURLs(conns []string) []string {
	seen := make(map[string]bool)
	var unique []string
	for _, conn := range conns {
		if !seen[conn] {
			seen[conn] = true
			unique = append(unique, conn)
		}
	}
	return unique
}
