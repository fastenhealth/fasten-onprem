# Product Context: Fasten On-Prem

## Product Vision

Fasten On-Prem aims to be a secure, self-hosted platform for individuals and potentially healthcare entities to manage and interact with health and medical data. It provides tools for data aggregation from various medical sources, visualization of health records, and user-friendly interfaces for data entry and exploration.

## Target Audience

*   **Individuals:** Patients seeking to consolidate and manage their personal health records from different providers.
*   **Healthcare Providers/Clinics (Potentially):** Smaller clinics or individual practitioners who need a self-managed system for patient data, though the primary focus seems consumer-oriented.

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
*   **Data Interaction & Visualization:**
    *   Centralized dashboard for an overview of health data (`dashboard`).
    *   Data exploration capabilities (`explore`).
    *   Timeline views for medical history (`report-medical-history-timeline-panel`).
    *   Wizards for guided data entry (e.g., `medical-record-wizard`, `medical-record-wizard-add-attachment`).
    *   Glossary lookup for medical terms (`glossary-lookup`).
*   **System Administration & Monitoring:**
    *   Management of background jobs (`background-jobs`).
*   **User Interface:**
    *   Modern, component-based frontend (Angular).
    *   Responsive design elements (implied by web technologies).
    *   Customizable UI elements (e.g., `gridstack` for dashboard widgets).

## User Scenarios

*   A new user signs up, completes a setup wizard, and connects their existing medical provider accounts.
*   A user logs in to view their latest lab results and adds a note about a recent doctor's visit.
*   An administrator (if applicable) views the status of data synchronization jobs.
*   A user explores their aggregated medical history, filtering by date or condition.

## Deployment Model

*   **On-Premise:** The core value proposition is self-hosting, giving users control over their data.
*   **Cloud/Desktop Variants:** The presence of `index-cloud.html` and `index-desktop.html`, along with environment files like `environment.cloud_sandbox.ts` and `environment.desktop_prod.ts`, suggests different build targets or deployment modes (e.g., a cloud-hosted version vs. a local desktop application).
