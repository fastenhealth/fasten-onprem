package models

//this model is based on FHIR401 Resource Composition - https://github.com/fastenhealth/gofhir-models/blob/main/fhir401/composition.go
type ResourceComposition struct {
	Title     string                         `bson:"title" json:"title"`
	RelatesTo []ResourceCompositionRelatesTo `bson:"relatesTo,omitempty" json:"relatesTo,omitempty"`
}

type ResourceCompositionRelatesTo struct {
	Target ResourceCompositionRelatesToTarget `bson:"target,omitempty" json:"target,omitempty"`
}

type ResourceCompositionRelatesToTarget struct {
	TargetReference ResourceCompositionRelatesToTargetReference `bson:"targetReference,omitempty" json:"targetReference,omitempty"`
}

type ResourceCompositionRelatesToTargetReference struct {
	Reference string `bson:"reference,omitempty" json:"reference,omitempty"`
}
