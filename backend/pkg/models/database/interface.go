package database

import (
	"encoding/json"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"gorm.io/datatypes"
)

type IFhirResourceModel interface {
	models.OriginBaser
	SetOriginBase(originBase models.OriginBase)
	SetResourceRaw(resourceRaw datatypes.JSON)
	GetSearchParameters() map[string]string
	PopulateAndExtractSearchParameters(rawResource json.RawMessage) error
}
