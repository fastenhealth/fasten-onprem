package models

import (
	"reflect"
)

type SystemSettings struct {
	InstallationID       string `json:"installation_id"`
	InstallationSecret   string `json:"installation_secret"`
	TypesenseDataIndexed bool   `json:"typesense_data_indexed"`
}

// see https://gist.github.com/lelandbatey/a5c957b537bed39d1d6fb202c3b8de06
func (s *SystemSettings) FromSystemSettingsEntry(entry *SystemSettingEntry) error {

	structType := reflect.ValueOf(s).Elem()

	for i := 0; i < structType.NumField(); i++ {
		typeField := structType.Type().Field(i)

		if jsonTagValue := typeField.Tag.Get("json"); jsonTagValue == entry.SettingKeyName {
			//fmt.Println("found field", field.Name)
			if entry.SettingDataType == "numeric" {
				structType.Field(i).SetInt(int64(entry.SettingValueNumeric))
			} else if entry.SettingDataType == "string" {
				structType.Field(i).SetString(entry.SettingValueString)
			} else if entry.SettingDataType == "bool" {
				structType.Field(i).SetBool(entry.SettingValueBool)
			} else if entry.SettingDataType == "array" {
				structType.Field(i).Set(reflect.ValueOf(entry.SettingValueArray))
			}
			break
		}
	}

	//if entry.SettingKeyName == "dashboard_locations" {
	//	s.DashboardLocations = entry.SettingValueArray
	//}
	return nil
}

func (s *SystemSettings) ToSystemSettingsEntry(entries []SystemSettingEntry) ([]SystemSettingEntry, error) {
	structType := reflect.ValueOf(s).Elem()
	fieldNameNdxLookup := map[string]int{}

	// Build lookup for existing entry keys
	for i := 0; i < len(entries); i++ {
		fieldNameNdxLookup[entries[i].SettingKeyName] = i
	}

	// Track known keys to avoid duplicates
	knownKeys := make(map[string]bool)
	for _, entry := range entries {
		knownKeys[entry.SettingKeyName] = true
	}

	structFields := structType.Type()

	// Loop through all fields in SystemSettings
	for i := 0; i < structType.NumField(); i++ {
		typeField := structFields.Field(i)
		fieldValue := structType.Field(i)
		jsonKey := typeField.Tag.Get("json")

		if jsonKey == "" {
			continue
		}

		// If entry exists, update it
		if ndx, ok := fieldNameNdxLookup[jsonKey]; ok {
			switch typeField.Type.Kind() {
			case reflect.Int, reflect.Int64:
				entries[ndx].SettingValueNumeric = int(fieldValue.Int())
				entries[ndx].SettingDataType = "numeric"
			case reflect.String:
				entries[ndx].SettingValueString = fieldValue.String()
				entries[ndx].SettingDataType = "string"
			case reflect.Bool:
				entries[ndx].SettingValueBool = fieldValue.Bool()
				entries[ndx].SettingDataType = "bool"
			case reflect.Slice:
				sliceVal := fieldValue.Slice(0, fieldValue.Len())
				entries[ndx].SettingValueArray = sliceVal.Interface().([]string)
				entries[ndx].SettingDataType = "array"
			}
		} else {
			// Add missing entry
			newEntry := SystemSettingEntry{
				SettingKeyName: jsonKey,
			}

			switch typeField.Type.Kind() {
			case reflect.Int, reflect.Int64:
				newEntry.SettingValueNumeric = int(fieldValue.Int())
				newEntry.SettingDataType = "numeric"
			case reflect.String:
				newEntry.SettingValueString = fieldValue.String()
				newEntry.SettingDataType = "string"
			case reflect.Bool:
				newEntry.SettingValueBool = fieldValue.Bool()
				newEntry.SettingDataType = "bool"
			case reflect.Slice:
				sliceVal := fieldValue.Slice(0, fieldValue.Len())
				newEntry.SettingValueArray = sliceVal.Interface().([]string)
				newEntry.SettingDataType = "array"
			}

			entries = append(entries, newEntry)
		}
	}

	return entries, nil
}
