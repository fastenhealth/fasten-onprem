# Project Brief: Fasten On-Prem

## Overview

Fasten On-Prem (`fasten-onprem`) is an open-source software project designed to empower users by securely connecting their healthcare providers together, creating a personal health record that never leaves their hands. It provides a self-hosted solution comprising a Go backend and an Angular frontend, structured as a monorepo.

## Purpose

The primary purpose of Fasten On-Prem is to serve as an open-source, self-hosted, personal/family electronic medical record (EMR) aggregator. It is designed to integrate with thousands of insurance companies, hospitals, and clinics to consolidate an individual's or family's medical history in one private, secure location. A key design principle is that it's built for individuals and families, not large clinics or enterprise healthcare systems.

## Core Principles

The development of Fasten On-Prem is guided by the following core principles:

*   **Self-Hosted & Private:** Ensuring user data remains under their control, is stored locally, and is not data-mined by third parties.
*   **Data Aggregation:** Consolidating health records from diverse healthcare providers (insurance companies, hospital networks, clinics, labs) across various health sectors (medical, dental, vision) into a single dashboard.
*   **Automation:** Automatically pulling Electronic Medical Records (EMRs) directly from providers using standards like FHIR and OAuth2 (Smart-on-FHIR), minimizing the need for manual data entry like scanning or OCR.
*   **Open Source:** Maintaining transparency by making the codebase available for contributions, auditing, and community development.

## Distribution Flavors

Fasten On-Prem is distributed primarily as Docker images in two main flavors:

*   **Sandbox Version (`ghcr.io/fastenhealth/fasten-onprem:sandbox`):** This version connects to a limited number of healthcare provider sandboxes. These sandboxes use test accounts and synthetic (fake) patient data, allowing users to explore Fasten's features and user interface without requiring access to or use of their actual personal medical information.
*   **Main Version (`ghcr.io/fastenhealth/fasten-onprem:main`):** This version is configured to connect to a broad network of over 25,000 healthcare institutions. Users can connect using their existing patient portal credentials to retrieve and store their actual EMRs within their self-hosted Fasten instance.

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
