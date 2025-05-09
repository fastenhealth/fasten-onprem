# Technical Context

This document outlines the technologies used, development setup, technical constraints, dependencies, and tool usage patterns for the project.

## Technologies Used:

- **Primary Language:** Go
- **Frameworks/Libraries:**
    - `github.com/urfave/cli/v2`: Used for building the command-line interface.
    - `github.com/sirupsen/logrus`: Utilized for structured logging with configurable levels.
    - `github.com/analogj/go-util/utils`: Provides various utility functions.
    - Internal packages: `config`, `database`, `errors`, `event_bus`, `version`, `web`, `resources` (located under `github.com/fastenhealth/fasten-onprem/backend/pkg/` and `github.com/fastenhealth/fasten-onprem/backend/resources`).
- **Data Storage:** SQLite is used as the database technology.
- **Configuration:** Configuration is handled via YAML files (`config.yaml`) and command-line flags.

## Development Setup:

- Requires a Go environment to build and run.
- Dependency management is likely handled by Go Modules (standard for modern Go projects).
- Configuration is loaded from `config.yaml` by default, or a specified file path, and can be overridden by environment variables or CLI flags.
- Specific Go version requirement: v1.22.1. Other setup details are not yet documented. *(To be confirmed)*

## Technical Constraints:

- No specific technical constraints were identified from the analyzed files. *(To be documented as they become known)*

## Dependencies:

- **External:**
    - `github.com/urfave/cli/v2`
    - `github.com/sirupsen/logrus`
    - `github.com/analogj/go-util/utils`
- **Internal:** Packages within `github.com/fastenhealth/fasten-onprem/backend/pkg/` and `github.com/fastenhealth/fasten-onprem/backend/resources`.
- **Management:** Assumed to be Go Modules.

## Tool Usage Patterns:

- The application is primarily controlled via a command-line interface (`fasten`) with commands for `start`, `version`, and `migrate`.
- Logging is implemented using `logrus`, allowing for different log levels and output destinations.
- Configuration is managed programmatically through the internal `config` package.
- Static resources (`related_versions.json`) are embedded directly into the Go binary using `//go:embed`.

## Build and Deployment:

- Details about the build and deployment process (e.g., using Makefiles, Docker, specific CI/CD pipelines) are not yet documented. *(To be documented)*

## Notes:

- The project structure suggests a clear separation of concerns with dedicated packages for configuration, database, web, etc.
- Version information is managed externally in `pkg/version` and `resources/related_versions.json`.
