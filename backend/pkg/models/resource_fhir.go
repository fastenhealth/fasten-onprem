package models

import "gorm.io/datatypes"

type ResourceFhir struct {
	OriginBase

	//embedded data
	Payload datatypes.JSON `json:"payload" gorm:"payload"`
}
