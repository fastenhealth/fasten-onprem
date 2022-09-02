package base

import (
	"context"
	"crypto/tls"
	"github.com/seborama/govcr"
	"golang.org/x/oauth2"
	"net/http"
	"path"
	"testing"
)

func OAuthVcrSetup(t *testing.T, enableRecording bool) *http.Client {
	accessToken := "PLACEHOLDER"
	if enableRecording {
		//this has to be disabled because CI is empty inside docker containers.
		accessToken = ""
	}

	ts := oauth2.StaticTokenSource(
		//setting a real access token here will allow API calls to connect successfully
		&oauth2.Token{AccessToken: accessToken},
	)

	tr := http.DefaultTransport.(*http.Transport)
	tr.TLSClientConfig = &tls.Config{
		InsecureSkipVerify: true, //disable certificate validation because we're playing back http requests.
	}
	insecureClient := http.Client{
		Transport: tr,
	}

	ctx := context.WithValue(oauth2.NoContext, oauth2.HTTPClient, insecureClient)
	tc := oauth2.NewClient(ctx, ts)

	vcrConfig := govcr.VCRConfig{
		Logging:      true,
		CassettePath: path.Join("testdata", "govcr-fixtures"),
		Client:       tc,

		//this line ensures that we do not attempt to create new recordings.
		//Comment this out if you would like to make recordings.
		DisableRecording: !enableRecording,
	}

	// HTTP headers are case-insensitive
	vcrConfig.RequestFilters.Add(govcr.RequestDeleteHeaderKeys("User-Agent", "user-agent"))

	vcr := govcr.NewVCR(t.Name(), &vcrConfig)
	return vcr.Client
}
