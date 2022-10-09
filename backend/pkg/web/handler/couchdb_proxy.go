package handler

import (
	"fmt"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
)

func CouchDBProxy(c *gin.Context) {
	appConfig := c.MustGet("CONFIG").(config.Interface)

	couchdbUrl := fmt.Sprintf("%s://%s:%s", appConfig.GetString("web.couchdb.scheme"), appConfig.GetString("web.couchdb.host"), appConfig.GetString("web.couchdb.port"))
	remote, err := url.Parse(couchdbUrl)
	if err != nil {
		panic(err)
	}

	proxy := httputil.NewSingleHostReverseProxy(remote)
	//Define the director func
	//This is a good place to log, for example
	proxy.Director = func(req *http.Request) {
		req.Header = c.Request.Header
		req.Header.Add("X-Forwarded-Host", req.Host)
		req.Header.Add("X-Origin-Host", remote.Host)
		req.Host = remote.Host
		req.URL.Scheme = remote.Scheme
		req.URL.Host = remote.Host
		log.Printf(c.Param("proxyPath"))
		req.URL.Path = strings.TrimPrefix(c.Param("proxyPath"), "/database")
	}

	proxy.ServeHTTP(c.Writer, c.Request)
}
