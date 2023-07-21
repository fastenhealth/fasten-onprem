package models

// ClientRegistrationResponse {
//    "redirect_uris": [
//        " https://fhir.epic.com/test/smart"
//    ],
//    "token_endpoint_auth_method": "none",
//    "grant_types": [
//        "urn:ietf:params:oauth:grant-type:jwt-bearer"
//    ],
//    "software_id": " d45049c3-3441-40ef-ab4d-b9cd86a17225",
//    "client_id": "G65DA2AF4-1C91-11EC-9280-0050568B7514",
//    "client_id_issued_at": 1632417134,
//    "jwks": {
//        "keys": [{
//                "kty": "RSA",
//                "n": "vGASMnWdI-ManPgJi5XeT15Uf1tgpaNBmxfa-_bKG6G1DDTsYBy2K1uubppWMcl8Ff_2oWe6wKDMx2-bvrQQkR1zcV96yOgNmfDXuSSR1y7xk1Kd-uUhvmIKk81UvKbKOnPetnO1IftpEBm5Llzy-1dN3kkJqFabFSd3ujqi2ZGuvxfouZ-S3lpTU3O6zxNR6oZEbP2BwECoBORL5cOWOu_pYJvALf0njmamRQ2FKKCC-pf0LBtACU9tbPgHorD3iDdis1_cvk16i9a3HE2h4Hei4-nDQRXfVgXLzgr7GdJf1ArR1y65LVWvtuwNf7BaxVkEae1qKVLa2RUeg8imuw",
//                "e": "AQAB"
//            }
//        ]
//    }
//}
type ClientRegistrationResponse struct {
	RedirectUrls            []string                      `json:"redirect_uris"`
	TokenEndpointAuthMethod string                        `json:"token_endpoint_auth_method"`
	GrantTypes              []string                      `json:"grant_types"`
	SoftwareId              string                        `json:"software_id"`
	ClientId                string                        `json:"client_id"`
	ClientIdIssuedAt        int                           `json:"client_id_issued_at"`
	Jwks                    ClientRegistrationRequestJwks `json:"jwks"`
}
