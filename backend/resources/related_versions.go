package resources

import (
	_ "embed"
	"encoding/json"
)

//go:embed related_versions.json
var relatedVersionsJson string

func GetRelatedVersions() (map[string]string, error) {
	var relatedVersions map[string]string
	err := json.Unmarshal([]byte(relatedVersionsJson), &relatedVersions)
	if err != nil {
		return nil, nil
	}

	return relatedVersions, nil
}
