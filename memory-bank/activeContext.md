# Active Context: Fasten On-Prem (Memory Bank Updated May 9, 2025)

## Current Focus
The user requested to understand how the provider sources are defined in the project. I have determined that the provider catalog is defined in the separate `fastenhealth/fasten-sources` repository and served via the Fasten Lighthouse service. I am now updating the Memory Bank to reflect this understanding.

## Project State Summary (as per reviewed files and recent updates)
*   **Repository:** `./`
*   **Structure:** Monorepo containing a Go backend and an Angular frontend.
*   **Key Technologies Identified:** Go (backend), Angular/TypeScript (frontend), Docker, Nix, Git, **Fasten Lighthouse (Authentication Gateway)**, **fastenhealth/fasten-sources (Provider Catalog Source of Truth)**.
*   **Primary Domain:** Healthcare/Medical data management, with strong support for FHIR standards and a clear understanding of the role of Fasten Lighthouse and `fasten-sources` in managing and providing access to the provider catalog.

## Outcome of this Task
*   Investigated how provider sources are defined, identifying the role of the `fastenhealth/fasten-sources` repository and Fasten Lighthouse.
*   Updating `techContext.md` to include details about `fasten-sources`.
*   Updating `systemPatterns.md` to clarify the role of Lighthouse and add a pattern for externalized source catalog management.
*   `activeContext.md` (this file) is being updated to reflect the current task and findings.
*   `progress.md` will be updated next to reflect the clarified understanding of the provider source definition process.

## Next Steps
Update `progress.md` and then use `attempt_completion` to finalize the task.
