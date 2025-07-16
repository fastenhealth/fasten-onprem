# Active Context: Fasten On-Prem (Memory Bank Updated July 16, 2025)

## Current Focus: LLM Chat Feature Maturation

The current focus is on documenting the mature implementation of the LLM-powered chat feature. The architecture has evolved to include a dedicated state management service, providing a more robust and maintainable design.

### Chat State Service (`frontend/src/app/pages/chat/chat-state.service.ts`)

A new `ChatStateService` has been introduced to handle all state management for the chat feature. This service encapsulates the logic for creating, loading, selecting, and deleting conversations, as well as managing the message history for the active conversation. This decouples state logic from the component, following best practices.

### Chat Component (`frontend/src/app/pages/chat/chat.component.ts`)

The `ChatComponent` now acts as the presentation layer, interacting with the `ChatStateService` to display data and handle user input.

*   **State Interaction:** It subscribes to observables from the `ChatStateService` to get the current list of messages, conversations, and the active conversation ID.
*   **Configuration Flag:** It includes a `USE_STREAMING_CHAT` boolean flag, allowing developers to easily switch between streaming and non-streaming modes for debugging and testing.
*   **Message Handling:** The `sendMessage` method orchestrates the process, calling either the streaming or non-streaming methods based on the configuration flag.

### Typesense Service (`frontend/src/app/services/typesense.service.ts`)

The `TypesenseService` manages all communication with the backend conversation API.

*   **Streaming Implementation (RxJS):** The `startConversationStreaming` method now returns an RxJS `Observable`. The `ChatComponent` subscribes to this observable and uses the `next`, `error`, and `complete` handlers to process the incoming stream, which is a more idiomatic Angular approach.
*   **Full Conversation Lifecycle:** The service now supports the full lifecycle of conversations, with methods for `getConversations`, `getConversationMessages`, and `deleteConversation`.
