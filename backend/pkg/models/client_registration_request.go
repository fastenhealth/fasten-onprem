package models

type ClientRegistrationRequest struct {
	SoftwareId string                        `json:"software_id"`
	Jwks       ClientRegistrationRequestJwks `json:"jwks"`
}

type ClientRegistrationRequestJwks struct {
	Keys []ClientRegistrationRequestJwksKey `json:"keys"`
}

type ClientRegistrationRequestJwksKey struct {
	KeyId          string `json:"kid"`
	KeyType        string `json:"kty"`
	PublicExponent string `json:"e"`
	Modulus        string `json:"n"`
}
