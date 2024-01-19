// Code generated by tygo. DO NOT EDIT.

//////////
// source: patient_access_brand.go

/**
 * TODO: generate via reflection
 */
export class PatientAccessBrand {
  /**
   * Fasten UUID for the brand - id should be a unique identifier for the brand. It is globally unique and should be a UUID
   */
  id: string;
  /**
   * List of identifiers for the organization, e.g., external system, etc NPI, etc
   * Identifiers SHOULD include a platform identifier, so we know where this entry came from, but not required
   */
  identifiers?: any /* datatypes.Identifier */[];
  /**
   * RFC3339 Date and time the organization was last updated - Timestamp should be the last updated datetime for the data from this source, not the current date
   */
  last_updated: string;
  /**
   * Primary name for the organization to display on a card, e.g., “General Hospital”
   * Note this is not used within the app, only the Portal name should be used.
   */
  name: string;
  /**
   * URL for the organization’s primary website. note this is distinct from a patient portal, described under “Patient Access Details” below
   */
  brand_website?: string;
  /**
   * URL for the organization’s logo, which will be displayed on a card, Note this is a fallback logo, the primary logo will always be the Portal logo
   */
  logo?: string;
  /**
   * List of alternate names for the organization, e.g., “GH”, “General”, “GH Hospital”
   */
  aliases?: string[];
  /**
   * List of locations for the organization
   * These should be the locations where the organization has a physical presence, e.g., a hospital or clinic"
   */
  locations?: any /* datatypes.Address */[];
  /**
   * Patient Access Details
   * These must be references to Patient Access Portal resource Ids
   */
  portal_ids: string[];
  /**
   * list of brand ids that were merged together to creat this brand
   */
  brand_ids?: string[];
}

//////////
// source: patient_access_endpoint.go

/**
 * TODO: generate via reflection
 */
export class PatientAccessEndpoint {
  /**
   * Fasten UUID for the endpoint
   */
  id: string;
  /**
   * List of identifiers for the endpoint, e.g., “GH1234”
   */
  identifiers?: any /* datatypes.Identifier */[];
  /**
   * RFC3339 Date and time the endpoint was last updated
   */
  last_updated: string;
  /**
   * Status of the endpoint, e.g., “active” - http://terminology.hl7.org/CodeSystem/endpoint-status
   */
  status: string;
  /**
   * Connection type for the endpoint, e.g., “hl7-fhir-rest” - http://terminology.hl7.org/CodeSystem/endpoint-connection-type
   */
  connection_type: string;
  /**
   * Platform type for the endpoint, e.g., “epic”, "cerner"
   */
  platform_type: string;
  /**
   * URL for the endpoint, must have trailing slash
   */
  url: string;
  /**
   * oauth endpoints
   */
  authorization_endpoint?: string;
  token_endpoint?: string;
  introspection_endpoint?: string;
  userinfo_endpoint?: string;
  /**
   * optional - required when Dynamic Client Registration mode is set
   */
  registration_endpoint?: string;
  /**
   * Fasten custom configuration
   */
  fhir_version?: string;
  smart_configuration_url?: string;
  fhir_capabilities_url?: string;
  /**
   * Software info
   */
  software_name?: string;
  software_version?: string;
  software_release_date?: string;
}

//////////
// source: patient_access_portal.go

/**
 * TODO: generate via reflection
 */
export class PatientAccessPortal {
  /**
   * Fasten UUID for the portal
   */
  id: string;
  /**
   * List of identifiers for the organization, e.g., “GH1234”
   */
  identifiers?: any /* datatypes.Identifier */[];
  /**
   * RFC3339 date & time of the last update to the patient portal’s information
   */
  last_updated: string;
  /**
   * Name of the patient portal, e.g., “MyChart”
   */
  name: string;
  /**
   * URL for the patient portal’s logo, which will be displayed on a card
   */
  logo?: string;
  /**
   * URL for the patient portal, where patients can manage accounts with this provider.
   */
  portal_website?: string;
  /**
   * Description of the patient portal, e.g., “Manage your health information with General Hospital”
   */
  description?: string;
  /**
   * List of endpoint IDs for the patient portal. This is used to associate the patient portal with the endpoints that are used to access it.
   */
  endpoint_ids: string[];
}