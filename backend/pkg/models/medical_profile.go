package models

//demographics	Object	(optional) (See demographics)
//alcohol	Object	(optional) The user’s alcohol usage. See alcohol object.
//smoking	Object	(optional) The user’s smoking habits. See smoking object.

type Profile struct {
	OriginBase
	//embedded structs
	Demographics Demographics `json:"demographics" gorm:"serializer:json;default:'{}'"`
}

type Demographics struct {
	Address            Address `json:"address,omitempty"`            //	Object	(See address object)
	Dob                *string `json:"dob,omitempty"`                //String	(optional) The user’s date of birth e.g. "04/21/1965"
	Ethnicity          *string `json:"ethnicity,omitempty"`          //	String	(optional) The ethnicity of the user e.g. "Not Hispanic of Latino"
	Gender             *string `json:"gender,omitempty"`             //	String	(optional) The user’s gender e.g. "male"
	Language           *string `json:"language,omitempty"`           //String	(optional) The user’s primary language e.g. "eng"
	MaritalStatus      *string `json:"maritalStatus,omitempty"`      //	String	(optional) The user’s marital status (eg: “married”, “single”)
	Name               Name    `json:"name,omitempty"`               //	Object	(optional) (See name object)
	Race               *string `json:"race,omitempty"`               //	String	(optional) The user’s race e.g. "White"
	EthnicityCodes     *string `json:"ethnicityCodes,omitempty"`     // ethnicityCodes	Array[Object]	(optional) CDC Race & Ethnicity and SNOMED CT Ethnicity codes: See codes
	MaritalStatusCodes *string `json:"maritalStatusCodes,omitempty"` // 	String	(optional) SNOMED CT Marital status codes: see codes object
	GenderCodes        *string `json:"genderCodes,omitempty"`        //String	(optional) SNOMED CT Gender codes: See codes
}

type Address struct {
	City    *string  `json:"city,omitempty"`    // (optional) City of address e.g. "SAN FRANCISCO"
	Country *string  `json:"country,omitempty"` // (optional) Country of address e.g. "US"
	State   *string  `json:"state,omitempty"`   // (optional) State of address e.g. "CA"
	Street  []string `json:"street,omitempty"`  //	Array[String]	(optional) Street of address e.g. ["156 22ND AVE NW"]
	Zip     *string  `json:"zip,omitempty"`     // (optional) Zip of address e.g. "94123"
}

type Name struct {
	Prefix *string  `json:"prefix,omitempty"` //	String	(optional) The title of the provider e.g. "MD"
	Given  []string `json:"given,omitempty"`  //	Array[String]	Name values associated with the provider e.g. ["Travis", "R"]
	Family *string  `json:"family,omitempty"` //	String	(optional) Family name of the provider e.g. "Liddell"
}
