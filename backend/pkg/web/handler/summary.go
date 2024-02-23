package handler

import (
	_ "embed"
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/utils/ips"
	"github.com/fastenhealth/gofhir-models/fhir401"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"net/http"
)

func GetSummary(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	summary, err := databaseRepo.GetSummary(c)
	if err != nil {
		logger.Errorln("An error occurred while retrieving summary", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": summary})
}

func GetIPSSummary(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	ipsBundle, ipsComposititon, err := databaseRepo.GetInternationalPatientSummaryBundle(c)
	if err != nil {
		logger.Errorln("An error occurred while retrieving IPS summary", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}

	if c.Query("format") == "" {
		c.JSON(http.StatusOK, gin.H{"success": true, "data": ipsBundle})
		return
	}

	narrative, err := ips.NewNarrative()
	if err != nil {
		logger.Errorln("An error occurred while parsing template", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}

	composititon := ipsComposititon.(*fhir401.Composition)

	if c.Query("format") == "html" {

		logger.Debugln("Rendering HTML")
		//create string writer
		content, err := narrative.RenderTemplate("index.gohtml", ips.NarrativeTemplateData{Composition: composititon})
		if err != nil {
			logger.Errorln("An error occurred while executing template", err)
			c.JSON(http.StatusInternalServerError, gin.H{"success": false})
			return
		}
		c.Header("Content-Type", "text/html; charset=utf-8")
		c.String(http.StatusOK, content)
		return
	}
	//} else if c.Query("format") == "pdf" {
	//
	//	c.Header("Content-Disposition", "attachment; filename=ips_summary.pdf")
	//	c.Header("Content-Type", "application/pdf")
	//	c.String(http.StatusOK, b.String())
	//	return
	//}
}
