# Active Context: Fasten On-Prem (Memory Bank Updated July 25, 2025)

## Current Focus
The application now includes a UPnP (Universal Plug and Play) feature for automatic port forwarding and an SSDP (Simple Service Discovery Protocol) feature for service discovery. This enhances ease of use for self-hosted instances by attempting to automatically configure the user's router and allowing mobile applications to automatically discover the Fasten API backend.

## Architectural Decisions

*   **UPnP Integration:** The UPnP logic is implemented in `backend/cmd/fasten/fasten.go` within the `startUpnpServer` function. It uses the `github.com/huin/goupnp` library to discover the external IP address and create a port mapping.
*   **SSDP Integration:** The SSDP logic is implemented in `backend/pkg/discovery/ssdp.go`. It uses the `github.com/koron/go-ssdp` library to advertise the Fasten API backend on the local network.
*   **Configuration:** The UPnP feature is enabled or disabled via the `upnp.enabled` flag in `config.yaml`. The SSDP feature is enabled or disabled via the `ssdp.enabled` flag in `config.yaml`.
*   **Error Handling:** The implementation includes non-fatal error handling, allowing the application to start even if UPnP or SSDP operations fail.

## Next Steps

*   There are no immediate next steps for this feature.
