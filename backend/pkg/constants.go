package pkg

type ResourceGraphType string

const (
	ContextKeyTypeConfig   string = "CONFIG"
	ContextKeyTypeDatabase string = "REPOSITORY"
	ContextKeyTypeLogger   string = "LOGGER"

	ContextKeyTypeAuthUsername string = "AUTH_USERNAME"
	ContextKeyTypeAuthToken    string = "AUTH_TOKEN"

	FhirResourceTypeComposition string = "Composition"

	ResourceGraphTypeMedicalHistory ResourceGraphType = "MedicalHistory"
	ResourceGraphTypeAddressBook    ResourceGraphType = "AddressBook"
	ResourceGraphTypeMedications    ResourceGraphType = "Medications"
	ResourceGraphTypeBillingReport  ResourceGraphType = "BillingReport"
)
