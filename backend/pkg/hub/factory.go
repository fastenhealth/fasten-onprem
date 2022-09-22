package hub

import (
	"context"
	"errors"
	"fmt"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/hub/internal/fhir/aetna"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/hub/internal/fhir/base"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/hub/internal/fhir/cerner"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/hub/internal/fhir/cigna"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/hub/internal/fhir/logica"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/hub/internal/fhir/manual"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/sirupsen/logrus"
	"net/http"
)

func NewClient(sourceType pkg.SourceType, ctx context.Context, appConfig config.Interface, globalLogger logrus.FieldLogger, credentials models.Source, testHttpClient ...*http.Client) (base.Client, *models.Source, error) {

	var sourceClient base.Client
	var updatedSource *models.Source
	var err error
	switch sourceType {
	case pkg.SourceTypeAetna:
		sourceClient, updatedSource, err = aetna.NewClient(ctx, appConfig, globalLogger, credentials, testHttpClient...)
	case pkg.SourceTypeAnthem:
		sourceClient, updatedSource, err = cigna.NewClient(ctx, appConfig, globalLogger, credentials, testHttpClient...)
	case pkg.SourceTypeCerner:
		sourceClient, updatedSource, err = cerner.NewClient(ctx, appConfig, globalLogger, credentials, testHttpClient...)
	case pkg.SourceTypeCigna:
		sourceClient, updatedSource, err = cigna.NewClient(ctx, appConfig, globalLogger, credentials, testHttpClient...)
	case pkg.SourceTypeLogica:
		sourceClient, updatedSource, err = logica.NewClient(ctx, appConfig, globalLogger, credentials, testHttpClient...)
	case pkg.SourceTypeManual:
		sourceClient, updatedSource, err = manual.NewClient(ctx, appConfig, globalLogger, credentials, testHttpClient...)
	default:
		return nil, updatedSource, errors.New(fmt.Sprintf("Unknown Source Type: %s", sourceType))
	}

	return sourceClient, updatedSource, err
}
