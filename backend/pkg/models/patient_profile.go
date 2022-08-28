package models

import "gorm.io/gorm"

//demographics	Object	(optional) (See demographics)
//alcohol	Object	(optional) The user’s alcohol usage. See alcohol object.
//smoking	Object	(optional) The user’s smoking habits. See smoking object.

type PatientProfile struct {
	gorm.Model
	User       User   `json:"user,omitempty"`
	UserID     uint   `json:"user_id" gorm:"uniqueIndex:idx_user_provider_patient"`
	ProviderId string `json:"provider_id" gorm:"uniqueIndex:idx_user_provider_patient"`
	PatientId  string `json:"patient_id" gorm:"uniqueIndex:idx_user_provider_patient"`

	//embedded structs
	Demographics `json:"demographics,omitempty"`
}

type Demographics struct {
	Address            Address `json:"address"`            //	Object	(See address object)
	Dob                string  `json:"dob"`                //String	(optional) The user’s date of birth e.g. "04/21/1965"
	Ethnicity          string  `json:"ethnicity"`          //	String	(optional) The ethnicity of the user e.g. "Not Hispanic of Latino"
	Gender             string  `json:"gender"`             //	String	(optional) The user’s gender e.g. "male"
	Language           string  `json:"language"`           //String	(optional) The user’s primary language e.g. "eng"
	MaritalStatus      string  `json:"maritalStatus"`      //	String	(optional) The user’s marital status (eg: “married”, “single”)
	Name               Name    `json:"name"`               //	Object	(optional) (See name object)
	Race               string  `json:"race"`               //	String	(optional) The user’s race e.g. "White"
	EthnicityCodes     string  `json:"ethnicityCodes"`     // ethnicityCodes	Array[Object]	(optional) CDC Race & Ethnicity and SNOMED CT Ethnicity codes: See codes
	MaritalStatusCodes string  `json:"maritalStatusCodes"` // 	String	(optional) SNOMED CT Marital status codes: see codes object
	GenderCodes        string  `json:"genderCodes"`        //String	(optional) SNOMED CT Gender codes: See codes
}

type Address struct {
	City    string   `json:"city"`    // (optional) City of address e.g. "SAN FRANCISCO"
	Country string   `json:"country"` // (optional) Country of address e.g. "US"
	State   string   `json:"state"`   // (optional) State of address e.g. "CA"
	Street  []string `json:"street"`  //	Array[String]	(optional) Street of address e.g. ["156 22ND AVE NW"]
	Zip     string   `json:"zip"`     // (optional) Zip of address e.g. "94123"
}

type Name struct {
	Prefix string   `json:"prefix"` //	String	(optional) The title of the provider e.g. "MD"
	Given  []string `json:"given"`  //	Array[String]	Name values associated with the provider e.g. ["Travis", "R"]
	Family string   `json:"family"` //	String	(optional) Family name of the provider e.g. "Liddell"
}
