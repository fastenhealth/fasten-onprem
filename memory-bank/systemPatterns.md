# System Design Patterns: Fasten On-Prem

This document outlines key architectural and design patterns observed or inferred from the Fasten On-Prem project structure.

## Architectural Patterns

*   **Monorepo:** The entire project (backend, frontend, and related scripts/configurations) is managed within a single Git repository. This simplifies dependency management between components and build processes.
*   **Client-Server Architecture:** A clear separation exists between the Angular frontend (client) and the Go backend (server).
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

*   **Local Data Storage (PouchDB/CouchDB):** The frontend uses a library wrapping **PouchDB** for local data persistence, with built-in synchronization capabilities to an external **CouchDB** instance.

## Build and Configuration Patterns

*   **Environment-Specific Configurations:** The `frontend/src/environments/` directory demonstrates a pattern for managing different configurations (API endpoints, feature flags) for various deployment environments (dev, prod, sandbox, desktop, cloud).
*   **Containerization (Docker):** Packaging the application into Docker containers for consistent deployment across different environments.
*   **Infrastructure as Code (Nix):** Using Nix (`flake.nix`) to define and manage reproducible development and build environments.

## Cross-Cutting Concerns

*   **Event Bus (Frontend):** `EventBusService` suggests a publish-subscribe mechanism for decoupled communication between components or services.
*   **HTTP Interceptors (Frontend):** `AuthInterceptorService` is used to modify outgoing HTTP requests (e.g., adding authentication tokens) or incoming responses.
