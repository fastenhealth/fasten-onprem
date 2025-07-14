package ips_pdf

import (
	"encoding/json"
	"fmt"
	"slices"
	"strings"

	"github.com/fastenhealth/fasten-onprem/backend/pkg/models/database"
	"github.com/johnfercher/maroto/v2/pkg/components/text"
	"github.com/johnfercher/maroto/v2/pkg/core"
	"gorm.io/datatypes"
)

func pluckMapListValue(raw datatypes.JSON, primaryKey, secondaryKey string) string {
	if raw == nil {
		return ""
	}

	var list []map[string]interface{}
	err := json.Unmarshal(raw, &list)
	if err != nil {
		return ""
	}

	var results []string
	for _, item := range list {
		if val, ok := item[primaryKey]; ok {
			if s, ok := val.(string); ok {
				results = append(results, s)
			}
		} else if secondaryKey != "" {
			if val, ok := item[secondaryKey]; ok {
				if s, ok := val.(string); ok {
					results = append(results, s)
				}
			}
		}
	}
	return strings.Join(slices.Compact(results), ", ")
}

func pluckStringListValue(raw datatypes.JSON) string {
	var parsed []string
	_ = json.Unmarshal(raw, &parsed)
	return strings.Join(slices.Compact(parsed), ", ")
}

func extractValueFromList(list []map[string]interface{}) string {
	var values []string

	for _, item := range list {
		value, ok := item["value"]
		if !ok {
			continue
		}

		values = append(values, fmt.Sprintf("%.2f", value))
	}

	return strings.Join(values, ", ")
}

func getObservationValue(observation database.FhirObservation) string {
	if observation.ValueString != nil {
		return pluckStringListValue(observation.ValueString)
	}

	if observation.ValueQuantity != nil {
		var list []map[string]interface{}
		err := json.Unmarshal(observation.ValueQuantity, &list)
		if err != nil {
			return ""
		}

		if len(list) > 0 {
			return extractValueFromList(list)
		}
	}
	if observation.ValueDate != nil {
		return observation.ValueDate.Format("2006-01-02")
	}
	if observation.ValueConcept != nil {
		return pluckMapListValue(observation.ValueConcept, "text", "display")
		
	}
	if observation.ComponentValueQuantity != nil {
		var list []map[string]interface{}
		err := json.Unmarshal(observation.ComponentValueQuantity, &list)
		if err != nil {
			return ""
		}

		if len(list) > 0 {
			return extractValueFromList(list)
		}
	}

	return ""
}

func extractUnitFromList(list []map[string]interface{}) string {
	var units []string

	for _, item := range list {
		unit, ok := item["unit"]
		if !ok {
			continue
		}

		units = append(units, fmt.Sprintf("%s", unit))
	}

	return strings.Join(units, ", ")
}

func getObservationUnit(observation database.FhirObservation) string {
	if observation.ValueQuantity != nil {
		var list []map[string]interface{}
		err := json.Unmarshal(observation.ValueQuantity, &list)
		if err != nil {
			return ""
		}

		if len(list) > 0 {
			return extractUnitFromList(list)
		} 
	}
	if (observation.ComponentValueQuantity != nil) {
		var list []map[string]interface{}
		err := json.Unmarshal(observation.ComponentValueQuantity, &list)
		if err != nil {
			return ""
		}

		if len(list) > 0 {
			return extractUnitFromList(list)
		} 
	}
	return ""
}

func newTextCol(size int, value string) core.Col {
	return text.NewCol(size, value, tableTextStyle)
}
