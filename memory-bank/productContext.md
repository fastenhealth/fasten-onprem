# Product Context: Fasten On-Prem

## Product Vision

Fasten On-Prem's vision is to empower individuals and families with a secure, self-hosted platform to aggregate, manage, and interact with their personal health records. The core idea is to create a comprehensive health record that remains entirely under the user's control, never leaving their hands. It provides tools for automated data aggregation from diverse medical sources, intuitive visualization of health records, and user-friendly interfaces for data entry, exploration, and understanding.

## Target Audience

*   **Primary:** Individuals and families who want to consolidate and manage their personal health records from different providers in a private, self-hosted environment.
*   **Note:** While potentially usable by small clinics, the project is explicitly designed and optimized for personal/family use, unlike traditional EMR systems.

## Key Features (Inferred from Project Structure)

*   **User Authentication & Management:**
    *   Secure sign-in and sign-up processes.
    *   User profile management (`patient-profile`).
    *   Role-based access control (e.g., `is-admin-auth-guard`).
    *   First-run setup wizard for new users (`auth-signup-wizard`, `show-first-run-wizard-guard`).
*   **Medical Data Management:**
    *   Connection to various medical sources (`medical-sources`, `medical-sources-connected`).
    *   Viewing and managing medical history (`medical-history`).
    *   Detailed views for lab reports (`report-labs`).
    *   Tools for creating and viewing specific health resources (`resource-creator`, `resource-detail`).
    *   Support for FHIR (Fast Healthcare Interoperability Resources) data standards (`fhir-card`, `fhir-datatable`, `fhir-path.pipe`).
    *   **Automated EMR Pulling:** Integrates with healthcare providers using standards like FHIR R4 and R3 and OAuth2 (specifically Smart-on-FHIR) with the `offline_access` scope to automatically retrieve and update Electronic Medical Records (EMRs). The `conduit` library is responsible for fetching and transforming this data.

*   **Healthcare Interoperability (FHIR):**
    *   FHIR (Fast Healthcare Interoperability Resources) is a critical standard enabling Fasten On-Prem to achieve its core purpose: aggregating health data from diverse sources.
    *   By leveraging FHIR, the system can connect to thousands of healthcare providers that expose patient data via FHIR APIs.
    *   This ensures that users can automatically pull their Electronic Medical Records (EMRs) directly from these providers, creating a comprehensive and up-to-date personal health record without manual data entry.
    *   FHIR's standardized data models and APIs facilitate seamless exchange of clinical and administrative data, making the vision of a consolidated personal health record a reality.

*   **Data Interaction & Visualization:**
    *   Centralized dashboard for an overview of health data (`dashboard`).
    *   Data exploration capabilities (`explore`).
    *   Timeline views for medical history (`report-medical-history-timeline-panel`).
    *   Wizards for guided data entry (e.g., `medical-record-wizard`, `medical-record-wizard-add-attachment`).
    *   Glossary lookup for medical terms (`glossary-lookup`).
    *   **Condition-specific Dashboards & Tracking:** Provides specialized dashboards and tracking capabilities tailored to specific health conditions or diagnostic tests.
*   **System Administration & Monitoring:**
    *   Management of background jobs (`background-jobs`).
*   **User Interface:**
    *   Modern, component-based frontend (Angular).
    *   Responsive design elements (implied by web technologies).
    *   Customizable UI elements (e.g., `gridstack` for dashboard widgets).

### Planned Future Features (from README)

*   **Multi-user support:** Designed to work well for families, allowing multiple user accounts within a single instance with configurable access permissions (admin, viewer roles).
*   **(Future) Clinical Recommendations:** Vaccination & condition-specific recommendations using NIH/WHO clinical care guidelines (HEDIS/CQL).
*   **(Future) Offline Querying:** A ChatGPT-style interface to query your own medical history offline.
*   **(Future) Smart Device Integration:** Integration with smart-devices & wearables.

## User Scenarios

*   A new user signs up, completes a setup wizard, and connects their existing medical provider accounts.
*   A user logs in to view their latest lab results and adds a note about a recent doctor's visit.
*   An administrator (if applicable) views the status of data synchronization jobs.
*   A user explores their aggregated medical history, filtering by date or condition.

## Deployment Model

*   **On-Premise:** The core value proposition is self-hosting, giving users control over their data.
*   **Cloud/Desktop Variants:** The presence of `index-cloud.html` and `index-desktop.html`, along with environment files like `environment.cloud_sandbox.ts` and `environment.desktop_prod.ts`, suggests different build targets or deployment modes (e.g., a cloud-hosted version vs. a local desktop application).
*   **Distribution:** Primarily distributed as Docker images, with 'sandbox' and 'main' flavors catering to testing with synthetic data vs. using real personal data from a wide network of providers (as detailed in `projectbrief.md`).

## Data Storage

*   **Local Storage:** Utilizes a library that wraps PouchDB for local data storage within the user's self-hosted instance.
*   **Synchronization:** The PouchDB wrapper includes functionality to sync the local database with an external/hosted CouchDB instance, enabling potential backup or advanced scenarios.
