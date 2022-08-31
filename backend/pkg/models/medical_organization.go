package models

type Organization struct {
	OriginBase

	Name    *string `json:"name,omitempty"`                                        //name	String	(optional) The name of the organization
	Address Address `json:"address,omitempty" gorm:"serializer:json;default:'{}'"` //address	String	(optional) Address of the provider
	Active  *bool   `json:"active,omitempty"`
}
