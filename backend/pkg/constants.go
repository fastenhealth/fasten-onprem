package pkg

type ResourceGraphType string
type BackgroundJobStatus string
type BackgroundJobType string
type BackgroundJobSchedule string

type DatabaseRepositoryType string

const (
	ResourceListPageSize int = 20

	ContextKeyTypeConfig         string = "CONFIG"
	ContextKeyTypeDatabase       string = "REPOSITORY"
	ContextKeyTypeLogger         string = "LOGGER"
	ContextKeyTypeEventBusServer string = "EVENT_BUS_SERVER"

	ContextKeyTypeAuthUsername    string = "AUTH_USERNAME"
	ContextKeyTypeAuthToken       string = "AUTH_TOKEN"
	ContextKeyTypeBackgroundJobID string = "BACKGROUND_JOB_ID"

	FhirResourceTypeComposition string = "Composition"

	ResourceGraphTypeMedicalHistory ResourceGraphType = "MedicalHistory"
	ResourceGraphTypeAddressBook    ResourceGraphType = "AddressBook"
	ResourceGraphTypeMedications    ResourceGraphType = "Medications"
	ResourceGraphTypeBillingReport  ResourceGraphType = "BillingReport"

	BackgroundJobStatusReady  BackgroundJobStatus = "STATUS_READY"
	BackgroundJobStatusLocked BackgroundJobStatus = "STATUS_LOCKED"
	BackgroundJobStatusFailed BackgroundJobStatus = "STATUS_FAILED"
	BackgroundJobStatusDone   BackgroundJobStatus = "STATUS_DONE"

	BackgroundJobTypeSync          BackgroundJobType = "SYNC"
	BackgroundJobTypeScheduledSync BackgroundJobType = "SCHEDULED_SYNC"

	BackgroundJobScheduleDaily    BackgroundJobSchedule = "DAILY"
	BackgroundJobScheduleWeekly   BackgroundJobSchedule = "WEEKLY"
	BackgroundJobScheduleBiWeekly BackgroundJobSchedule = "BIWEEKLY"
	BackgroundJobScheduleMonthly  BackgroundJobSchedule = "MONTHLY"

	DatabaseRepositoryTypeSqlite   DatabaseRepositoryType = "sqlite"
	DatabaseRepositoryTypePostgres DatabaseRepositoryType = "postgres"
)
