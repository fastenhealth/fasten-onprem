package pkg

//go:generate stringer -type=SourceType
// SourceType contains all the various medical, insurance, health care providers which Fasten can communicate with
type SourceType string

const (
	SourceTypeAetna            SourceType = "aetna"
	SourceTypeAnthem           SourceType = "anthem"
	SourceTypeCigna            SourceType = "cigna"
	SourceTypeHumana           SourceType = "humana"
	SourceTypeKaiser           SourceType = "kaiser"
	SourceTypeUnitedHealthcare SourceType = "unitedhealthcare"
)
