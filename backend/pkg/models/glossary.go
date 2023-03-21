package models

// Glossary contains patient friendly terms for medical concepts
// Can be retrieved by Code and CodeSystem
// Structured similar to ValueSet https://hl7.org/fhir/valueset.html
type Glossary struct {
	ModelBase
	Code        string `json:"code" gorm:"uniqueIndex:idx_glossary_term"`
	CodeSystem  string `json:"code_system" gorm:"uniqueIndex:idx_glossary_term"`
	Publisher   string `json:"publisher"`
	Title       string `json:"title"`
	Url         string `json:"url"`
	Description string `json:"description"`
}
