# Technical Context: Fasten On-Prem

## Overall Architecture

Fasten On-Prem employs a client-server architecture with a Go-based backend and an Angular frontend. The project is structured as a monorepo.

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

## API & Data Interchange

*   **Frontend-Backend Communication:** The Angular frontend likely communicates with the Go backend via HTTP requests.
*   **Type Safety:** `tygo.yaml` suggests the use of Tygo to generate TypeScript types from Go structs, ensuring consistency between frontend and backend data models.
*   **Data Standards:** FHIR (Fast Healthcare Interoperability Resources) is a key data standard, indicated by various frontend components and pipes (e.g., `fhir-card`, `fhir-datatable`, `fhir-path.pipe`).

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
