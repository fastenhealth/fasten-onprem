# Project Brief: Fasten On-Prem

## Overview

`fasten-onprem` is a software project designed to provide a self-hosted solution, likely related to the "Fasten" product line. It comprises a backend system developed in Go and a frontend user interface built with Angular. The project is structured as a monorepo, containing both backend and frontend codebases.

## Key Components

*   **Backend:** Written in Go, located in the `backend/` directory. The main application logic likely resides in `backend/cmd/fasten/fasten.go`.
*   **Frontend:** An Angular application, located in the `frontend/` directory. It handles user interaction and data presentation.
*   **Containerization:** The project utilizes Docker for packaging and deployment, as indicated by `Dockerfile` and `docker-compose.yml`. This suggests portability and ease of setup in various environments.
*   **Build & Package Management:**
    *   `Makefile` is present, suggesting a centralized build process.
    *   Go modules (`go.mod`, `go.sum`) are used for backend dependency management.
    *   Yarn (`yarn.lock`, `frontend/package.json`) is used for frontend dependency management.
    *   `packagr.yml` might be a custom or specific packaging tool.
*   **Environment Management:**
    *   Nix (`flake.nix`, `flake.lock`) is used, indicating a reproducible development and build environment.
    *   `.envrc` suggests integration with `direnv` for environment variable management.
*   **Configuration:**
    *   `config.yaml` likely holds primary application configuration.
    *   `tygo.yaml` suggests a tool for generating TypeScript types from Go code, facilitating frontend-backend integration.
*   **Version Control:** The project is managed using Git.

## Purpose

While not explicitly stated in the file structure, the presence of frontend components related to "medical-record-wizard," "fhir-card," and "report-labs" strongly suggests that `fasten-onprem` is a platform for managing healthcare or medical data.
