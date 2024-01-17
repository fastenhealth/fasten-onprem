package _20231017112246

import (
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/google/uuid"
)

type UserSettingEntry struct {
	//GORM attributes, see: http://gorm.io/docs/conventions.html
	models.ModelBase
	User   *User     `json:"user,omitempty" gorm:"-"`
	UserID uuid.UUID `json:"user_id" gorm:"not null;index:,unique,composite:user_setting_key_name"`

	SettingKeyName        string `json:"setting_key_name" gorm:"not null;index:,unique,composite:user_setting_key_name"`
	SettingKeyDescription string `json:"setting_key_description"`
	SettingDataType       string `json:"setting_data_type"`

	SettingValueNumeric int      `json:"setting_value_numeric"`
	SettingValueString  string   `json:"setting_value_string"`
	SettingValueBool    bool     `json:"setting_value_bool"`
	SettingValueArray   []string `json:"setting_value_array" gorm:"column:setting_value_array;type:text;serializer:json"`
}

func (s UserSettingEntry) TableName() string {
	return "user_settings"
}
