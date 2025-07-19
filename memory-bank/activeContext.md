# Active Context: Fasten On-Prem (Memory Bank Updated July 19, 2025)

## Current Focus: Backend Refactoring

The current focus is on refactoring the backend to improve modularity and maintainability.

### /env Route Refactoring

The logic for the `/api/env` route has been extracted from `backend/pkg/web/server.go` into a dedicated handler module at `backend/pkg/web/handler/env.go`. The `GetEnv` handler has been updated to expose the `typesense` section of the application configuration, nested under a `typesense` key in the JSON response. This change aligns with the existing pattern of separating route logic into dedicated handler files, making the codebase cleaner and more organized, while also limiting the configuration data exposed by the endpoint.

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

### Typesense Conversation Model Creation and Configuration

In addition to the `conversation_store` collection, the `backend/pkg/search/typesense.go` file now also handles the creation of a specific conversation model with the ID "conv-model-1". This model is created upon server initialization if it does not already exist.

The parameters for this conversation model are externalized into `config.dev.yaml` under the `typesense.conversation_model` section. This allows for easy modification of model parameters without code changes.

The configuration keys are:
*   `typesense.conversation_model.id`: The unique ID for the conversation model (e.g., "conv-model-1").
*   `typesense.conversation_model.name`: The name of the LLM model (e.g., "vllm/llama3.1:8b").
*   `typesense.conversation_model.vllm_url`: The URL of the vLLM server (e.g., "http://host.docker.internal:11434").
*   `typesense.conversation_model.history_collection`: The name of the collection used for conversation history (e.g., "conversation_store").

Validation for these configuration parameters has been added to `backend/pkg/config/config.go` to ensure that all required model parameters are present in the configuration file.
