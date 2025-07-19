# Active Context: Fasten On-Prem (Memory Bank Updated July 19, 2025)

## Current Focus: System Stability and Enhancement

The primary focus is on maintaining system stability and enhancing the existing feature set. Recent efforts have solidified the backend and frontend architecture.

### Key Architectural Patterns in Place:

*   **Backend Configuration Exposure:** A dedicated `/api/env` endpoint is now a stable part of the architecture. It provides the frontend with necessary, non-sensitive configuration values, such as the `typesense` configuration for the chat feature. This promotes loose coupling and simplifies frontend configuration management.

*   **LLM Chat Feature:** The LLM-powered chat functionality is fully integrated and stable.
    *   **State Management:** A dedicated `ChatStateService` manages all chat-related state on the frontend, ensuring a clean separation of concerns.
    *   **Backend Support:** The backend is equipped with a `conversation_store` collection in Typesense to persist chat history, and the "conv-model-1" is configured and created at startup. The model's parameters are externalized to `config.dev.yaml` for flexibility.
    *   **API:** The frontend interacts with the backend through a well-defined API that supports the full conversation lifecycle (create, load, delete messages and conversations) using an RxJS-based streaming implementation for real-time updates.

With these foundational pieces in place, current work is shifting towards iterative improvements, bug fixes, and potential new features that build upon this stable base.
