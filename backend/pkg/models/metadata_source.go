package models

import (
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg"
)

type MetadataSource struct {
	SourceType pkg.SourceType `json:"source_type"`
	Display    string         `json:"display"`
	Category   []string       `json:"category"`

	Supported    bool `json:"enabled"`
	Confidential bool `json:"confidential"`
}
