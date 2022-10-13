package handler

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
)

//TODO, there are security implications to this, we need to make sure we lock this down.
func CORSProxy(c *gin.Context) {
	//appConfig := c.MustGet("CONFIG").(config.Interface)
	corsUrl := fmt.Sprintf("https://%s", strings.TrimPrefix(c.Param("proxyPath"), "/"))

	remote, err := url.Parse(corsUrl)
	remote.RawQuery = c.Request.URL.Query().Encode()
	if err != nil {
		panic(err)
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
		log.Printf(c.Param("proxyPath"))
		req.URL.Path = remote.Path

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
