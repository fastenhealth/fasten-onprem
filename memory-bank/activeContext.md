# Active Context: Fasten On-Prem (Memory Bank Updated July 15, 2025)

## Current Focus: LLM Chat & Streaming Implementation

The current focus is on understanding and documenting the recently implemented LLM-powered chat feature, particularly its streaming capabilities. This involves analyzing the interaction between the `ChatComponent` and the `TypesenseService` to provide a clear record of the implementation.

### Chat Component (`frontend/src/app/pages/chat/chat.component.ts`)

The `ChatComponent` is the user-facing element for the chat functionality. It manages the display of messages and handles user input. Two key methods are implemented for sending messages:

1.  **`sendMessage()` (Non-Streaming):**
    *   This is a standard asynchronous method that sends the user's message to the `TypesenseService`.
    *   It waits for the complete response from the service before displaying the bot's answer.
    *   This method is suitable for simple, single-response interactions.

2.  **`_sendMessage()` (Streaming):**
    *   This method implements the real-time streaming of the bot's response.
    *   It immediately adds a placeholder for the bot's message in the UI.
    *   It calls the `startConversationStreaming` method in the `TypesenseService`, providing a set of callbacks to handle the incoming data stream.
    *   **`onChunk`**: This callback is executed for each piece of the response received from the server. It appends the new text to the bot's message placeholder, creating the appearance of a real-time stream.
    *   **`onComplete`**: This callback is executed when the full response has been received. It can be used to finalize the message or perform any cleanup actions.
    *   **`onError`**: This callback handles any errors that occur during the streaming process.

### Typesense Service (`frontend/src/app/services/typesense.service.ts`)

The `TypesenseService` encapsulates the communication with the Typesense search and conversation API.

1.  **`startConversation()` (Non-Streaming):**
    *   This method uses the `multiSearch.perform` method from the Typesense client.
    *   It sends the user's query and returns a single, complete response.

2.  **`startConversationStreaming()` (Streaming):**
    *   This is the core of the streaming implementation.
    *   It uses the `documents().search()` method from the Typesense client.
    *   Crucially, it sets the `conversation_stream: true` parameter in the search request. This tells the Typesense server to send the response in chunks.
    *   It passes a `streamConfig` object, which contains the `onChunk`, `onComplete`, and `onError` callbacks provided by the `ChatComponent`. The Typesense client library then invokes these callbacks as data arrives.

This implementation provides a responsive and interactive user experience for the chat feature, allowing users to see the bot's response as it is being generated.
