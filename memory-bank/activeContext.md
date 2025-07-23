# Active Context: Fasten On-Prem (Memory Bank Updated July 23, 2025)

## Current Focus
The current focus is to implement dynamic service discovery (mDNS) for the mobile sync feature. The architectural decision to use Docker's `host` network mode has been confirmed and applied.

## Architectural Decisions

*   **Docker Networking for mDNS:** To allow the backend to broadcast its mDNS service on the host's LAN, the `docker-compose.yml` is configured to use `network_mode: "host"`. This ensures the container shares the host's network stack, making the service discoverable by mobile clients on the same network. This approach has been validated and works on the target Docker Desktop environment.

## Next Steps: Implement mDNS in Go Backend

The next step is to add the mDNS service registration logic to the Go backend.

1.  **Choose mDNS Library:** Select a suitable Go library for mDNS/ZeroConf (e.g., `grandcat/zeroconf`).
2.  **Integrate into Backend:**
    *   Add the library to `go.mod`.
    *   In the backend startup sequence (likely in `backend/cmd/fasten/fasten.go`), add code to register the `_fasten-sync._tcp.local` service.
    *   The service should be registered on port `8080`, as the application now runs directly on the host's network.
    *   Ensure the mDNS service is properly shut down when the application exits.
3.  **Update Mobile Client (Future Task):** Once the backend is broadcasting the service, the mobile client will need to be updated to perform the mDNS discovery.
