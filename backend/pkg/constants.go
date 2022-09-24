package pkg

// SourceType contains all the various medical, insurance, health care providers which Fasten can communicate with
type SourceType string

const (
	SourceTypeManual SourceType = "manual"

	SourceTypeAetna              SourceType = "aetna"
	SourceTypeAthena             SourceType = "athena"
	SourceTypeAnthem             SourceType = "anthem"
	SourceTypeCareEvolution      SourceType = "careevolution"
	SourceTypeCedarSinai         SourceType = "cedarssinai"
	SourceTypeCerner             SourceType = "cerner"
	SourceTypeCigna              SourceType = "cigna"
	SourceTypeCommonSpirit       SourceType = "commonspirit"
	SourceTypeDeltaDental        SourceType = "deltadental"
	SourceTypeDignityHealth      SourceType = "dignityhealth"
	SourceTypeEpic               SourceType = "epic"
	SourceTypeHealthIT           SourceType = "healthit"
	SourceTypeHCAHealthcare      SourceType = "hcahealthcare"
	SourceTypeHumana             SourceType = "humana"
	SourceTypeKaiser             SourceType = "kaiser"
	SourceTypeLogica             SourceType = "logica"
	SourceTypeMetlife            SourceType = "metlife"
	SourceTypeProvidence         SourceType = "providence"
	SourceTypeStanford           SourceType = "stanford"
	SourceTypeSutter             SourceType = "sutter"
	SourceTypeTrinity            SourceType = "trinity"
	SourceTypeUCSF               SourceType = "ucsf"
	SourceTypeUnitedHealthcare   SourceType = "unitedhealthcare"
	SourceTypeBlueButtonMedicare SourceType = "bluebutton"
	SourceTypeVerity             SourceType = "verity"
)
