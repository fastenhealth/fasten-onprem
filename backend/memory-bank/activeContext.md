# Active Context

This document tracks the current focus of work, recent changes, next steps, active decisions, important patterns, and learnings. It serves as a dynamic record of the project's ongoing development.

## Current Work Focus:

- Initial setup and population of the Memory Bank documentation.
- Establishing a baseline understanding of the `fasten-onprem` project based on existing code and project structure.

## Recent Changes:

- Read all existing (template) Memory Bank files.
- Analyzed project files (`cmd/fasten/fasten.go`, `resources/*`) to infer project details.
- Drafted and populated the following Memory Bank files with initial content:
    - `projectbrief.md`
    - `techContext.md`
    - `productContext.md`
    - `systemPatterns.md`
- Currently in the process of populating `activeContext.md` and `progress.md`.

## Next Steps:

- Update `techContext.md` with SQLite and Go version details (Completed).
- Update `activeContext.md` to reflect decisions and next steps (In progress).
- Update `progress.md` to reflect decisions and the CLI update task.
- Update `cmd/fasten/fasten.go` to change the CLI application name from 'goweb' to 'fasten-onprem' and update its description.
- Define the immediate next development tasks for the `fasten-onprem` project itself (e.g., outlining core feature implementation).
- Establish a regular process for updating the Memory Bank as development progresses.

## Active Decisions:

- Decision to systematically populate the Memory Bank files by analyzing existing project artifacts and through discussion with the user.
- Decision to use Markdown for all Memory Bank files.
- Selected SQLite as the database technology.
- Confirmed Go v1.22.1 as the target Go version.

## Important Patterns and Preferences:

- **Memory-Driven Development:** Relying entirely on the Memory Bank for project context due to session memory resets.
- **Iterative Documentation:** Updating Memory Bank files step-by-step as information is gathered or changes are made.
- **User Confirmation:** Seeking user confirmation before committing changes to Memory Bank files.

## Learnings and Project Insights:

- The `fasten-onprem` project is a Go-based backend system, likely a CLI application serving web functionalities, focused on providing an on-premise health data management solution.
- Key components include CLI handling, configuration management, logging, database interaction (migrations), and an event bus.
- The project is in its early stages, with foundational code present but detailed application logic and features yet to be fully developed or documented.
- The Memory Bank itself was initially a set of templates.

## Pending Tasks:

- Define a specific database technology for the project (currently noted as TBD in `techContext.md`).
- Outline a detailed feature backlog for `fasten-onprem`.
- Plan the development sprints or work cycles.
- Set up or document the version control strategy more explicitly.
- Investigate and document the build and deployment process.

## Notes:

This `activeContext.md` reflects the very beginning of structured project tracking through the Memory Bank.
