# Active Context: Fasten On-Prem (Memory Bank Updated July 16, 2025)

## Current Focus: LLM Chat Feature Maturation & Typesense Integration

The current focus is on documenting the mature implementation of the LLM-powered chat feature and ensuring its underlying data storage in Typesense is correctly configured. The architecture has evolved to include a dedicated state management service, providing a more robust and maintainable design, complemented by new Typesense collection for conversation data.

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

### Backend Typesense Collection (`backend/pkg/search/typesense.go`)

The `backend/pkg/search/typesense.go` file has been updated to include the automatic creation of a new Typesense collection named `conversation_store` during the `Init` function. This collection is designed to store conversation-related data for the LLM chat feature.

The schema for the `conversation_store` collection is as follows:

```json
{
    "name": "conversation_store",
    "fields": [
        {
            "name": "conversation_id",
            "type": "string",
            "facet": true
        },
        {
            "name": "model_id",
            "type": "string"
        },
        {
            "name": "timestamp",
            "type": "int32"
        },
        {
            "name": "role",
            "type": "string",
            "index": false
        },
        {
            "name": "message",
            "type": "string",
            "index": false
        }
    ]
}
```
This ensures that the necessary data structure for storing chat conversations is in place when the Typesense client is initialized.
