package pkg

type ResourceGraphType string
type BackgroundJobStatus string
type BackgroundJobType string
type BackgroundJobSchedule string

type DatabaseRepositoryType string

type InstallationVerificationStatus string
type InstallationQuotaStatus string

type IPSSections string
type IPSSectionGroups string
type UserRole string

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

	InstallationVerificationStatusMissing  InstallationVerificationStatus = "MISSING"  //email is missing for this installation
	InstallationVerificationStatusPending  InstallationVerificationStatus = "PENDING"  //email has not been verified
	InstallationVerificationStatusVerified InstallationVerificationStatus = "VERIFIED" //email has been verified
	InstallationQuotaStatusActive          InstallationQuotaStatus        = "ACTIVE"
	InstallationQuotaStatusConsumed        InstallationQuotaStatus        = "CONSUMED"

	IPSSectionsMedicationSummary     IPSSections = "medication_summary"
	IPSSectionsAllergiesIntolerances IPSSections = "allergies_intolerances"
	IPSSectionsProblemList           IPSSections = "problem_list"
	IPSSectionsImmunizations         IPSSections = "immunizations"
	IPSSectionsHistoryOfProcedures   IPSSections = "history_of_procedures"
	IPSSectionsMedicalDevices        IPSSections = "medical_devices"
	IPSSectionsDiagnosticResults     IPSSections = "diagnostic_results"
	IPSSectionsVitalSigns            IPSSections = "vital_signs"
	IPSSectionsHistoryOfIllness      IPSSections = "history_of_illness"
	IPSSectionsPregnancy             IPSSections = "pregnancy"
	IPSSectionsSocialHistory         IPSSections = "social_history"
	IPSSectionsPlanOfCare            IPSSections = "plan_of_care"
	IPSSectionsFunctionalStatus      IPSSections = "functional_status"
	IPSSectionsAdvanceDirectives     IPSSections = "advance_directives"

	IPSSectionGroupsRequired    IPSSectionGroups = "required"
	IPSSectionGroupsRecommended IPSSectionGroups = "recommended"
	IPSSectionGroupsOptional    IPSSectionGroups = "optional"

	UserRoleUser  UserRole = "user"
	UserRoleAdmin UserRole = "admin"
)

var IPSSectionsList = []IPSSections{
	IPSSectionsMedicationSummary,
	IPSSectionsAllergiesIntolerances,
	IPSSectionsProblemList,
	IPSSectionsImmunizations,
	IPSSectionsHistoryOfProcedures,
	IPSSectionsMedicalDevices,
	IPSSectionsDiagnosticResults,
	IPSSectionsVitalSigns,
	IPSSectionsHistoryOfIllness,
	IPSSectionsPregnancy,
	IPSSectionsSocialHistory,
	IPSSectionsPlanOfCare,
	IPSSectionsFunctionalStatus,
	IPSSectionsAdvanceDirectives,
}

var IPSSectionGroupsOrdered = map[IPSSectionGroups][]IPSSections{
	IPSSectionGroupsRequired: []IPSSections{
		IPSSectionsMedicationSummary,
		IPSSectionsAllergiesIntolerances,
		IPSSectionsProblemList,
	},
	IPSSectionGroupsRecommended: []IPSSections{
		IPSSectionsImmunizations,
		IPSSectionsHistoryOfProcedures,
		IPSSectionsMedicalDevices,
		IPSSectionsDiagnosticResults,
	},
	IPSSectionGroupsOptional: []IPSSections{
		IPSSectionsVitalSigns,
		IPSSectionsHistoryOfIllness,
		IPSSectionsPregnancy,
		IPSSectionsSocialHistory,
		IPSSectionsPlanOfCare,
		IPSSectionsFunctionalStatus,
		IPSSectionsAdvanceDirectives,
	},
}
