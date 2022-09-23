package aetna

import (
	"context"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/database"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/hub/internal/fhir/base"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/sirupsen/logrus"
	"net/http"
)

type AetnaClient struct {
	*base.FHIR401Client
}

func NewClient(ctx context.Context, appConfig config.Interface, globalLogger logrus.FieldLogger, source models.Source, testHttpClient ...*http.Client) (base.Client, *models.Source, error) {
	baseClient, updatedSource, err := base.NewFHIR401Client(ctx, appConfig, globalLogger, source, testHttpClient...)
	return AetnaClient{
		baseClient,
	}, updatedSource, err
}

//Overrides

func (c AetnaClient) SyncAll(db database.DatabaseRepository) error {

	bundle, err := c.GetResourceBundle("Patient")
	if err != nil {
		c.Logger.Infof("An error occurred while getting patient bundle %s", c.Source.PatientId)
		return err
	}

	wrappedResourceModels, err := c.ProcessBundle(bundle)
	if err != nil {
		c.Logger.Infof("An error occurred while processing patient bundle %s", c.Source.PatientId)
		return err
	}
	//todo, create the resources in dependency order

	for _, apiModel := range wrappedResourceModels {
		err = db.UpsertResource(context.Background(), apiModel)
		if err != nil {
			c.Logger.Info("An error occurred while upserting resource")
			return err
		}
	}
	return nil
}
