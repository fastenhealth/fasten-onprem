package pkg

type ResourceGraphType string

const (
	ResourceListPageSize int = 20

	ContextKeyTypeConfig         string = "CONFIG"
	ContextKeyTypeDatabase       string = "REPOSITORY"
	ContextKeyTypeLogger         string = "LOGGER"
	ContextKeyTypeEventBusServer string = "EVENT_BUS_SERVER"

	ContextKeyTypeAuthUsername string = "AUTH_USERNAME"
	ContextKeyTypeAuthToken    string = "AUTH_TOKEN"

	FhirResourceTypeComposition string = "Composition"

	ResourceGraphTypeMedicalHistory ResourceGraphType = "MedicalHistory"
	ResourceGraphTypeAddressBook    ResourceGraphType = "AddressBook"
	ResourceGraphTypeMedications    ResourceGraphType = "Medications"
	ResourceGraphTypeBillingReport  ResourceGraphType = "BillingReport"
)
