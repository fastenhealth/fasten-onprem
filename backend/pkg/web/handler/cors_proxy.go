package handler

import (
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"

	sourceDefinitions "github.com/fastenhealth/fasten-sources/definitions"
	"github.com/gin-gonic/gin"
)

// SECURITY: there are security implications to this, this may require some additional authentication to limit misuse
// this is a whitelisted CORS proxy, it is only used to proxy requests to Token Exchange urls for specified endpoint
func CORSProxy(c *gin.Context) {

	endpointId := strings.Trim(c.Param("endpointId"), "/")

	//get the endpoint definition
	endpointDefinition, err := sourceDefinitions.GetSourceDefinition(sourceDefinitions.GetSourceConfigOptions{
		EndpointId: endpointId,
	})

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": fmt.Sprintf("endpoint not found: %s", endpointId),
		})
		return
	}

	//SECURITY: if the endpoint definition does not have CORSRelayRequired set to true, then return a 404
	if endpointDefinition.CORSRelayRequired != true {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "endpoint does not require CORS Relay.",
		})
		return
	}

	//SECURITY: the proxy URL must start with the same URL as the endpoint.TokenUri
	corsUrl := fmt.Sprintf("https://%s", strings.TrimPrefix(c.Param("proxyPath"), "/"))

	//we'll lowercase to normalize the comparison
	if !strings.HasPrefix(strings.ToLower(corsUrl), strings.ToLower(endpointDefinition.TokenEndpoint)) {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "invalid proxy URL, must match TokenEndpoint",
		})
		return
	}

	remote, err := url.Parse(corsUrl)
	remote.RawQuery = c.Request.URL.Query().Encode()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "invalid proxy URL, could not parse",
		})
		return
	}

	proxy := httputil.ReverseProxy{}
	//Define the director func
	//This is a good place to log, for example
	proxy.Director = func(req *http.Request) {
		req.Header = c.Request.Header
		req.Header.Add("X-Forwarded-Host", req.Host)
		req.Header.Add("X-Origin-Host", remote.Host)
		req.Host = remote.Host
		req.URL.Scheme = remote.Scheme
		req.URL.Host = remote.Host
		log.Printf("%s", c.Param("proxyPath"))
		req.URL.Path = remote.Path
		req.Body = c.Request.Body

		//TODO: throw an error if the remote.Host is not allowed
	}

	proxy.ModifyResponse = func(r *http.Response) error {
		//b, _ := ioutil.ReadAll(r.Body)
		//buf := bytes.NewBufferString("Monkey")
		//buf.Write(b)
		//r.Body = ioutil.NopCloser(buf)
		r.Header.Set("Access-Control-Allow-Methods", "GET,HEAD")
		r.Header.Set("Access-Control-Allow-Credentials", "true")
		r.Header.Set("Access-Control-Allow-Origin", "*")
		return nil
	}

	proxy.ServeHTTP(c.Writer, c.Request)
}
