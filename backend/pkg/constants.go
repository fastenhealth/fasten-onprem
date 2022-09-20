package pkg

//go:generate stringer -type=SourceType
// SourceType contains all the various medical, insurance, health care providers which Fasten can communicate with
type SourceType string

const (
	SourceTypeManual SourceType = "manual"

	SourceTypeAetna                        SourceType = "aetna"
	SourceTypeAnthem                       SourceType = "anthem"
	SourceTypeCedarSinai                   SourceType = "cedarssinai"
	SourceTypeCigna                        SourceType = "cigna"
	SourceTypeCommonSpirit                 SourceType = "commonspirit"
	SourceTypeDeltaDental                  SourceType = "deltadental"
	SourceTypeDignityHealth                SourceType = "dignityhealth"
	SourceTypeHCAHealthcare                SourceType = "hcahealthcare"
	SourceTypeHumana                       SourceType = "humana"
	SourceTypeKaiser                       SourceType = "kaiser"
	SourceTypeLogica                       SourceType = "logica"
	SourceTypeMetlife                      SourceType = "metlife"
	SourceTypeProvidence                   SourceType = "providence"
	SourceTypeStanford                     SourceType = "stanford"
	SourceTypeSutter                       SourceType = "sutter"
	SourceTypeTrinity                      SourceType = "trinity"
	SourceTypeUCSF                         SourceType = "ucsf"
	SourceTypeUnitedHealthcare             SourceType = "unitedhealthcare"
	SourceTypeVeteransHealthAdministration SourceType = "bluebutton"
	SourceTypeVerity                       SourceType = "verity"
)
