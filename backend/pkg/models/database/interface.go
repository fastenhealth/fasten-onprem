package database

import (
	"encoding/json"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"gorm.io/datatypes"
	"time"
)

type IFhirResourceModel interface {
	models.OriginBaser
	SetOriginBase(originBase models.OriginBase)
	SetResourceRaw(resourceRaw datatypes.JSON)
	SetSortTitle(sortTitle *string)
	SetSortDate(sortDate *time.Time)
	GetSearchParameters() map[string]string
	PopulateAndExtractSearchParameters(rawResource json.RawMessage) error
}
