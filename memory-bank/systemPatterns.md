# System Design Patterns: Fasten On-Prem

This document outlines key architectural and design patterns observed or inferred from the Fasten On-Prem project structure.

## Architectural Patterns

*   **Monorepo:** The entire project (backend, frontend, and related scripts/configurations) is managed within a single Git repository. This simplifies dependency management between components and build processes.
*   **Client-Server Architecture:** A clear separation exists between the Angular frontend (client) and the Go backend (server).
*   **Authentication Gateway/Proxy (Fasten Lighthouse):** Fasten On-Prem interacts with the Fasten Lighthouse service, which acts as an authentication gateway and proxy. Its primary architectural role is to provide a central directory for healthcare providers and to facilitate the SMART-on-FHIR authentication flow, particularly for providers requiring Confidential Clients or when the self-hosted instance is not directly internet-accessible. It handles secure storage of client secrets and proxies the token exchange step in these specific scenarios, simplifying the connection process for the user's self-hosted application. Crucially, Lighthouse also serves the comprehensive catalog of healthcare providers, which is defined and maintained in the separate `fastenhealth/fasten-sources` repository. Patient data does not flow through Lighthouse.
*   **Externalized Source Catalog Management:** The detailed information about healthcare providers (brands, endpoints, portals) is managed externally in the `fastenhealth/fasten-sources` GitHub repository, separate from the `fasten-onprem` codebase. This repository is the source of truth for the provider catalog, which is then consumed by the Fasten Lighthouse service and made available to Fasten On-Prem.
*   **Shared Library:** A dedicated TypeScript library (`frontend/src/lib/`) is used to house code intended for use across different JavaScript environments (frontend, Web Workers, potentially Node.js), enforcing a separation from browser-specific code.
*   **Component-Based UI (Frontend):** The Angular frontend is built using a modular, component-based architecture.
    *   **Smart/Container Components (Pages):** Located in `frontend/src/app/pages/`, these components are typically route-level components responsible for fetching data and orchestrating presentation components.
    *   **Presentational/Dumb Components:** Located in `frontend/src/app/components/`, these components are focused on UI rendering and emit events to parent components. `shared.module.ts` likely groups common presentational components.
*   **Service Layer (Frontend):** Angular services (`frontend/src/app/services/`) encapsulate business logic, API interactions, and shared state. Examples include `AuthService` and `FastenApiService`.
*   **Modular Design (Frontend):** Angular modules (`AppModule`, `SharedModule`, `PipesModule`, `DirectivesModule`, `AppRoutingModule`) are used to organize and manage different parts of the application.

## Backend Patterns

*   **RESTful API:** The Go backend likely exposes a RESTful API for the frontend to consume, a common pattern for web applications.
*   **Command Pattern (CLI):** The `backend/cmd/fasten/fasten.go` structure suggests a command-line interface or entry point for the backend application, possibly following a command pattern for different operations.

## Frontend Design Patterns

*   **Dependency Injection (Angular):** Heavily used throughout the Angular application (`dependency-injection.ts` might be a custom setup or documentation). Services, components, and other classes are provided and injected where needed.
*   **Routing (Angular):** `AppRoutingModule` defines navigation paths and maps them to page components.
*   **Auth Guards (Angular):** `frontend/src/app/auth-guards/` implement route protection based on authentication status and user roles (e.g., `IsAuthenticatedAuthGuard`, `IsAdminAuthGuard`).
*   **Pipes (Angular):** Custom data transformation logic is encapsulated in pipes (`frontend/src/app/pipes/`) for use in templates (e.g., `HumanNamePipe`, `FhirPathPipe`).
*   **Directives (Angular):** Custom DOM manipulation and behavior are added via directives (`frontend/src/app/directives/`) like `ExternalLinkDirective`.
*   **Reactive Programming (RxJS):** Angular's deep integration with RxJS implies its use for handling asynchronous operations, event streams, and state management within services.
*   **Lazy Loading (Potential):** While not explicitly confirmed, Angular's routing capabilities allow for lazy loading of feature modules, which is a common optimization pattern.

## Data Handling Patterns

*   **Model-View-Controller (MVC) or Model-View-ViewModel (MVVM) Variant (Frontend):** Angular applications generally follow these patterns, separating data (models), presentation (views/templates), and logic (components/services).
*   **Data Transformation Objects (DTOs) / View Models:** The use of `tygo.yaml` to generate TypeScript types from Go structs suggests that specific data structures are used for communication between backend and frontend, acting as DTOs or view models.
*   **FHIR Standard for Health Data:** The project consistently uses FHIR-related components and pipes, indicating adherence to this standard for healthcare data interoperability. This is a core pattern that enables the system to connect to a wide range of healthcare providers.
    *   **FHIR Resources:** FHIR defines a set of "Resources" (e.g., Patient, Observation, Condition, Medication) which are the fundamental building blocks of healthcare data exchange. Fasten On-Prem leverages these standardized resources to represent and store aggregated patient data consistently, regardless of the source system.
    *   **FHIR APIs:** Healthcare providers expose patient data through FHIR APIs. Fasten On-Prem interacts with these APIs to retrieve the relevant Resources.
    *   **SMART-on-FHIR:** The project utilizes SMART-on-FHIR, an implementation guide that layers OAuth2 on top of FHIR. This provides a secure and standardized way for Fasten On-Prem to authenticate with provider systems and obtain authorization to access patient data on behalf of the user.
    *   **Supported Versions:** The system specifically supports **FHIR R4** and **FHIR R3** via the `conduit` library, ensuring compatibility with a broad range of existing provider implementations.

    *   **SMART-on-FHIR Authorization Flow (User-Facing App Launch):** Fasten On-Prem primarily utilizes the user-facing SMART App Launch flow, which implements the standard OAuth 2.0 authorization code grant. This process allows users to securely authorize Fasten On-Prem to access their FHIR-based health data from provider systems. The flow involves several steps:
        1.  **Discovery:** Fasten On-Prem discovers the provider's authorization and token endpoints by fetching the `.well-known/smart-configuration` file from the FHIR server base URL.
        2.  **Authorization Request:** Redirecting the user's browser to the healthcare provider's authorization server with required parameters (client ID, redirect URI, requested scopes, etc.).
        3.  **User Authentication & Consent:** The user authenticates with their provider and grants Fasten On-Prem permission to access their data for the requested scopes (e.g., `patient/*.read` for reading patient data, `offline_access` for long-lived access).
        4.  **Authorization Code Grant:** Upon user approval, the provider's authorization server redirects the user back to Fasten On-Prem's specified redirect URI with a temporary authorization code.
        5.  **Token Exchange:** Fasten On-Prem's backend exchanges the authorization code with the provider's token endpoint for an access token. If the `offline_access` scope was requested and granted, a refresh token is also issued.
        6.  **API Access:** The obtained access token is included in the `Authorization` header (as `Bearer [access_token]`) of subsequent requests to the provider's FHIR API to retrieve patient data.
        7.  **Token Refresh (if applicable):** If a refresh token was issued, it can be used to obtain new access tokens when the current one expires, allowing Fasten On-Prem to continue fetching data without requiring the user to re-authenticate immediately.

*   **Local Data Storage (PouchDB/CouchDB):** The frontend uses a library wrapping **PouchDB** for local data persistence, with built-in synchronization capabilities to an external **CouchDB** instance.

## Build and Configuration Patterns

*   **Environment-Specific Configurations:** The `frontend/src/environments/` directory demonstrates a pattern for managing different configurations (API endpoints, feature flags) for various deployment environments (dev, prod, sandbox, desktop, cloud).
*   **Containerization (Docker):** Packaging the application into Docker containers for consistent deployment across different environments.
*   **Infrastructure as Code (Nix):** Using Nix (`flake.nix`) to define and manage reproducible development and build environments.

## Cross-Cutting Concerns

*   **Event Bus (Frontend):** `EventBusService` suggests a publish-subscribe mechanism for decoupled communication between components or services.
*   **HTTP Interceptors (Frontend):** `AuthInterceptorService` is used to modify outgoing HTTP requests (e.g., adding authentication tokens) or incoming responses.

## Sync Patterns

### Mobile Sync via QR Code

The system supports syncing with a mobile client (e.g., "Health Wallet") through a token-based authorization flow initiated by a QR code. This feature was introduced in pull request #8.

*   **Backend Implementation:**
    *   **API Endpoints:** A new set of API endpoints under `/api/secure/sync/` was added to handle the entire sync process. This includes endpoints for initiating the sync, generating tokens, managing connected devices, and retrieving sync history.
    *   **JWT Enhancement:** The JWT generation logic was extended to create special `sync` tokens. These tokens are temporary (24-hour validity) and contain specific claims like `token_id` and `token_type` to distinguish them from regular session tokens.
    *   **Database Integration:** New GORM models (`SyncToken`, `SyncTokenHistory`, `SyncConnection`, `DeviceSyncHistory`) were added to the database to persist information about sync tokens, their usage, and the devices connected to the system. A corresponding database migration was created to set up the required tables.
    *   **Authentication Middleware:** The `RequireAuth` middleware was updated to validate these `sync` tokens, ensuring that only authorized mobile clients can access the sync endpoints.

*   **Frontend Implementation:**
    *   **Sync Page:** A new page was created at `/sync` to provide a user interface for this feature.
    *   **QR Code Generation:** The page uses the `qrcode` library to generate a QR code containing the sync token and server connection details.
    *   **Token Management:** The UI displays a list of all active and past sync tokens, allowing users to monitor connected devices and revoke their access if needed.
    *   **History View:** The page also provides a view of the sync history, giving users an audit trail of sync activities.

*   **User Flow:**
    1.  The user navigates to the "Sync" page in the web UI.
    2.  They click a button to generate a new sync token.
    3.  A QR code is displayed, containing the token and the server's connection details (including its local IP address).
    4.  The user scans this QR code with their mobile app.
    5.  The mobile app uses the information from the QR code to connect to the Fasten On-Prem server and start syncing data.

*   **Usability Improvements:**
    *   The pull request also introduced `start.sh` and `start.bat` scripts. These scripts simplify the process of running the application locally by automatically detecting the host's local IP address and making it available to the Docker container. This is crucial for ensuring the mobile client can connect to the server on the local network.

*   **Dynamic Service Discovery (mDNS):**
    *   **Backend:** The Fasten On-Prem backend registers itself as a service on the local network using mDNS (Bonjour/ZeroConf). This is implemented in a dedicated `startZeroconfServer` function in `backend/cmd/fasten/fasten.go` using the `github.com/grandcat/zeroconf` library.
    *   **Configuration:** The service is configurable via `config.yaml` and can be enabled/disabled. Default settings are managed centrally in `backend/pkg/config/config.go`.
    *   **Resilience:** The application is designed to be resilient; a failure in the mDNS registration process is logged as a non-fatal warning, allowing the main application to continue running.
    *   **Dynamic Metadata:** The service broadcasts dynamic information, such as the application version, in its TXT records.
    *   **Mobile Client:** The mobile client can discover the server's current IP address by querying for the `_fasten._tcp` service on the network. This makes the sync feature resilient to network changes and improves the overall user experience.
