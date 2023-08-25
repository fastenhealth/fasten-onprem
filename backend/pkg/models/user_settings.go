package models

import (
	"reflect"
)

type UserSettings struct {
	DashboardLocations []string `json:"dashboard_locations"`
}

// see https://gist.github.com/lelandbatey/a5c957b537bed39d1d6fb202c3b8de06
func (s *UserSettings) FromUserSettingsEntry(entry *UserSettingEntry) error {

	structType := reflect.ValueOf(s).Elem()

	for i := 0; i < structType.NumField(); i++ {
		typeField := structType.Type().Field(i)

		if jsonTagValue := typeField.Tag.Get("json"); jsonTagValue == entry.SettingKeyName {
			//fmt.Println("found field", field.Name)
			if entry.SettingDataType == "numeric" {
				structType.Field(i).SetInt(int64(entry.SettingValueNumeric))
			} else if entry.SettingDataType == "string" {
				structType.Elem().Field(i).SetString(entry.SettingValueString)
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

func (s *UserSettings) ToUserSettingsEntry(entries []UserSettingEntry) ([]UserSettingEntry, error) {

	structType := reflect.ValueOf(s).Elem()

	fieldNameNdxLookup := map[string]int{}

	for i := 0; i < structType.NumField(); i++ {
		typeField := structType.Type().Field(i)
		jsonTagValue := typeField.Tag.Get("json")
		fieldNameNdxLookup[jsonTagValue] = i
	}

	for ndx, entry := range entries {
		fieldId := fieldNameNdxLookup[entry.SettingKeyName]

		if entry.SettingDataType == "numeric" {
			entries[ndx].SettingValueNumeric = int(structType.Field(fieldId).Int())
		} else if entry.SettingDataType == "string" {
			entries[ndx].SettingValueString = structType.Elem().Field(fieldId).String()
		} else if entry.SettingDataType == "bool" {
			entries[ndx].SettingValueBool = structType.Field(fieldId).Bool()
		} else if entry.SettingDataType == "array" {
			sliceVal := structType.Field(fieldId).Slice(0, structType.Field(fieldId).Len())

			entries[ndx].SettingValueArray = sliceVal.Interface().([]string)
		}
	}

	return entries, nil
}
