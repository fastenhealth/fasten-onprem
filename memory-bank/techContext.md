# Technical Context: Fasten On-Prem

## Overall Architecture

Fasten On-Prem employs a client-server architecture with a Go-based backend and an Angular frontend. The project is structured as a monorepo, which also includes a shared TypeScript library (`frontend/src/lib/`) intended for use in both the frontend and potential Web Workers or Node.js environments.

## Backend Technologies

*   **Language:** Go
    *   Main application entry point: `backend/cmd/fasten/fasten.go`
    *   Resource handling: `backend/resources/related_versions.go` (example)
*   **Dependency Management:** Go Modules (`go.mod`, `go.sum`)
*   **API:** Likely a RESTful API serving the Angular frontend.

## Frontend Technologies

*   **Framework:** Angular
    *   Configuration: `angular.json`
    *   Main module: `frontend/src/app/app.module.ts`
    *   Routing: `frontend/src/app/app-routing.module.ts`
*   **Language:** TypeScript
    *   Configuration: `frontend/tsconfig.json`, `frontend/tsconfig.app.json`, `frontend/tsconfig.spec.json`
*   **Package Manager:** Yarn (`yarn.lock`, `frontend/.yarnrc.yml`, `frontend/package.json`)
*   **Styling:** SCSS
    *   Global styles: `frontend/src/custom.scss`, `frontend/src/styles.scss`
    *   Component-level styles are also used.
*   **Component Structure:**
    *   Reusable UI components: `frontend/src/app/components/` (e.g., `fhir-card`, `header`, `footer`)
    *   Page-level components: `frontend/src/app/pages/` (e.g., `dashboard`, `medical-history`)
*   **State Management:** While not explicitly defined by file names, Angular applications typically use services (e.g., `frontend/src/app/services/auth.service.ts`, `frontend/src/app/services/fasten-api.service.ts`) for state management, potentially in conjunction with RxJS.
*   **Testing:**
    *   Unit Testing: Karma (`frontend/karma.conf.js`)
    *   End-to-End (E2E) Testing: Protractor (`frontend/e2e/protractor.conf.js`)
*   **Build System:** Angular CLI (implied by `angular.json` and standard Angular project structure).
*   **Linting:** TSLint (`frontend/tslint.json`), EditorConfig (`frontend/.editorconfig`).
*   **Browser Compatibility:** `.browserslistrc` defines target browsers.
*   **Shared Library (`frontend/src/lib/`):** Contains TypeScript code intended for use across different JavaScript environments (Angular, Web Workers, potentially Node.js). Code in this directory must avoid browser-specific APIs.

## API & Data Interchange

*   **Frontend-Backend Communication:** The Angular frontend likely communicates with the Go backend via HTTP requests.
*   **Type Safety:** `tygo.yaml` suggests the use of Tygo to generate TypeScript types from Go structs, ensuring consistency between frontend and backend data models.
*   **Data Standards:** FHIR (Fast Healthcare Interoperability Resources) is the primary data standard used for representing and exchanging healthcare information.
    *   **What is FHIR?** FHIR is a standard for exchanging healthcare information electronically. It defines a set of "Resources" that represent granular clinical and administrative concepts (like Patient, Observation, Condition, etc.) and specifies how these resources can be exchanged using modern web standards, primarily RESTful APIs.
    *   **Role in Fasten On-Prem:** FHIR is fundamental to Fasten On-Prem's ability to connect to and retrieve data from diverse healthcare provider systems. It provides the common language and structure needed to understand and store data from thousands of different sources.
    *   **Supported Versions:** Fasten On-Prem currently supports **FHIR R4** and **FHIR R3**. R4 is the current normative version, while R3 is still widely used. Supporting both ensures compatibility with a broader range of provider systems.
*   **Data Fetching & Transformation:** The `conduit` library (located within `frontend/src/lib/`) is a key component responsible for retrieving patient data from various medical providers and transforming it into the internal data model used by Fasten On-Prem.
    *   `conduit` interacts with healthcare provider systems using the **FHIR R4** and **FHIR R3** protocols via their exposed APIs.
    *   It handles the authentication (using SMART-on-FHIR/OAuth2) and data retrieval process.
    *   After fetching FHIR Resources, `conduit` transforms this data into a format suitable for local storage and use within the Fasten On-Prem application.

    *   **SMART-on-FHIR Technical Details:** Fasten On-Prem leverages SMART-on-FHIR, which builds upon OAuth 2.0, for secure authorization. It primarily uses the **Authorization Code Grant** flow for user-facing data access. Key technical aspects include:
        *   **Authorization Server:** Healthcare providers expose an authorization server endpoint where users are directed to grant permissions.
        *   **Token Endpoint:** Providers also expose a token endpoint where Fasten On-Prem exchanges the authorization code for access and refresh tokens.
        *   **Scopes:** Fasten On-Prem requests specific scopes (e.g., `patient/*.read`, `offline_access`) to define the level of access required. The `offline_access` scope is crucial for enabling the application to fetch data periodically in the background without requiring the user to log in repeatedly.
        *   **Access Tokens:** Short-lived credentials used to authorize requests to the FHIR API. These are included in the `Authorization: Bearer <access_token>` header.
        *   **Refresh Tokens:** Long-lived credentials (issued when `offline_access` is granted) used to obtain new access tokens when the current one expires, maintaining continuous data synchronization.
        *   **Client Authentication:** When exchanging the authorization code for tokens at the token endpoint, Fasten On-Prem (as a confidential client) likely uses **symmetric client authentication** by providing its `client_id` and `client_secret` (if registered as confidential) via HTTP Basic authentication or in the request body. Asymmetric authentication (using public/private keys) is also part of the SMART specification but is less common for user-facing apps like Fasten.
        *   **Fasten Lighthouse's Role in Authentication:** Fasten Lighthouse acts as an "Auth Gateway" or proxy in the SMART-on-FHIR flow, particularly for providers requiring **Confidential Clients** or when the self-hosted Fasten instance is not directly internet-accessible.
            *   It securely stores the `client_secret` for Confidential Clients centrally, preventing the need to distribute these secrets to each user's self-hosted instance.
            *   It proxies the **token exchange** step (exchanging the authorization code for access/refresh tokens) for Confidential Clients, using the securely stored `client_secret`.
            *   It leverages **PKCE (Proof Key for Code Exchange)** to enhance security, ensuring that even if an authorization code is intercepted, it cannot be exchanged for a token without the `code_verifier` held by the Fasten client.
            *   It utilizes **Fragment Response Mode** during the redirect back to the client, ensuring the authorization code is passed in the URL fragment and is not sent to the Lighthouse server.
            *   Patient health data (FHIR resources) **never passes through Lighthouse**. Data retrieval is always a direct connection between the self-hosted Fasten instance and the healthcare provider's FHIR API.
        *   The `conduit` library is responsible for managing this OAuth 2.0 flow, including handling redirects, token exchange (either directly with the provider for Public Clients or via Lighthouse for Confidential Clients), token storage, and using tokens for API calls.

## Data Storage (Frontend)

*   **Local Database:** The frontend utilizes a library (located within `frontend/src/lib/database/`) that acts as a wrapper around **PouchDB** for managing local, client-side data storage.
*   **Synchronization:** This PouchDB wrapper includes built-in functionality to synchronize the local database with an external or hosted **CouchDB** instance.

## Build, Deployment, and Environment

*   **Containerization:** Docker (`Dockerfile`, `docker-compose.yml`) is used for creating and managing application containers. `.dockerignore` specifies files to exclude from Docker images.
*   **Build Automation:** `Makefile` provides build scripts and automation.
*   **Package Building:** `packagr.yml` (purpose might be specific to the project's packaging needs, possibly for creating distributable versions).
*   **Reproducible Environments:** Nix (`flake.nix`, `flake.lock`) is used to define and manage reproducible development and build environments.
*   **Environment Variables:** `.envrc` suggests the use of `direnv` for managing environment-specific configurations.
*   **Environment-Specific Configurations (Frontend):** The `frontend/src/environments/` directory contains different configuration files for various deployment environments (e.g., `environment.dev.ts`, `environment.prod.ts`, `environment.desktop_prod.ts`).
*   **Version Scripting:** `frontend/git.version.sh` is likely used to embed Git version information into the frontend build.

## Version Control

*   **System:** Git
    *   `.gitignore` and `.gitattributes` manage versioned files and their attributes.

## Development Environment

*   **IDE/Editor:** `fasten-onprem.code-workspace` indicates usage of Visual Studio Code with a pre-configured workspace.

## Cross-Cutting Concerns

*   **Event Bus (Frontend):** `EventBusService` suggests a publish-subscribe mechanism for decoupled communication between components or services.
*   **HTTP Interceptors (Frontend):** `AuthInterceptorService` is used to modify outgoing HTTP requests (e.g., adding authentication tokens) or incoming responses.
