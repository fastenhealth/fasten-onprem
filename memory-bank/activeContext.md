# Active Context: Fasten On-Prem (Memory Bank Updated July 23, 2025)

## Current Focus
The mDNS (Zeroconf) service discovery feature has been refactored to improve robustness, configurability, and maintainability.

## Architectural Decisions

*   **mDNS Refactoring:** The mDNS implementation has been moved to a dedicated, encapsulated function (`startZeroconfServer`). It now includes graceful error handling, is fully configurable via `config.yaml`, and centralizes its default settings in `backend/pkg/config/config.go` to align with existing patterns. The service also broadcasts dynamic data, such as the application version, via TXT records.

## Next Steps

*   **Mobile Client Update:** The mobile client needs to be updated to perform mDNS discovery to take advantage of the improved backend service.
