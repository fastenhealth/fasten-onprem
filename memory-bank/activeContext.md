# Active Context: Fasten On-Prem (Memory Bank Updated July 23, 2025)

## Current Focus
The application now includes a UPnP (Universal Plug and Play) feature for automatic port forwarding. This enhances ease of use for self-hosted instances by attempting to automatically configure the user's router.

## Architectural Decisions

*   **UPnP Integration:** The UPnP logic is implemented in `backend/cmd/fasten/fasten.go` within the `startUpnpServer` function. It uses the `github.com/huin/goupnp` library to discover the external IP address and create a port mapping.
*   **Configuration:** The feature is enabled or disabled via the `upnp.enabled` flag in `config.yaml`.
*   **Error Handling:** The implementation includes non-fatal error handling, allowing the application to start even if UPnP operations fail.

## Next Steps

*   There are no immediate next steps for this feature.
