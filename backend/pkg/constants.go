package pkg

type ResourceGraphType string

const (
	ResourceListPageSize int = 20

	ContextKeyTypeConfig   string = "CONFIG"
	ContextKeyTypeDatabase string = "REPOSITORY"
	ContextKeyTypeLogger   string = "LOGGER"

	ContextKeyTypeSSEEventBusServer string = "SSE_EVENT_BUS_SERVER"
	ContextKeyTypeSSEClientChannel  string = "SSE_CLIENT_CHANNEL"

	ContextKeyTypeAuthUsername string = "AUTH_USERNAME"
	ContextKeyTypeAuthToken    string = "AUTH_TOKEN"

	FhirResourceTypeComposition string = "Composition"

	ResourceGraphTypeMedicalHistory ResourceGraphType = "MedicalHistory"
	ResourceGraphTypeAddressBook    ResourceGraphType = "AddressBook"
	ResourceGraphTypeMedications    ResourceGraphType = "Medications"
	ResourceGraphTypeBillingReport  ResourceGraphType = "BillingReport"
)
