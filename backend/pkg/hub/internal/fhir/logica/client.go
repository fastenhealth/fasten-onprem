package logica

import (
	"context"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/hub/internal/fhir/base"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/sirupsen/logrus"
	"net/http"
)

type LogicaClient struct {
	*base.FHIR401Client
}

func NewClient(ctx context.Context, appConfig config.Interface, globalLogger logrus.FieldLogger, source models.Source, testHttpClient ...*http.Client) (base.Client, *models.Source, error) {
	baseClient, updatedSource, err := base.NewFHIR401Client(ctx, appConfig, globalLogger, source, testHttpClient...)
	return LogicaClient{
		baseClient,
	}, updatedSource, err
}
