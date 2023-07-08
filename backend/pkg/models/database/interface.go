package database

import (
	"encoding/json"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
)

type IFhirResourceModel interface {
	models.OriginBaser
	SetOriginBase(originBase models.OriginBase)
	GetSearchParameters() map[string]string
	PopulateAndExtractSearchParameters(rawResource json.RawMessage) error
}
