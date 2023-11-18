package database

import (
	"encoding/json"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"gorm.io/datatypes"
	"time"
)

type IFhirResourceModel interface {
	models.OriginBaser
	SetOriginBase(originBase models.OriginBase)
	SetResourceRaw(resourceRaw datatypes.JSON)
	SetSortTitle(sortTitle *string)
	SetSortDate(sortDate *time.Time)
	SetSourceUri(sourceUri *string)
	GetSearchParameters() map[string]string
	PopulateAndExtractSearchParameters(rawResource json.RawMessage) error
}

// Search Parameter Types (as stored in the database)

type SearchParameterTokenType []struct {
	System string `json:"system"`
	Code   string `json:"code"`
	Text   string `json:"text"`
}

type SearchParameterStringType []string

type SearchParameterDateType []struct {
	StartDate string `json:"start"`
	EndDate   string `json:"end"`
	Instant   bool   `json:"instant"`
}
