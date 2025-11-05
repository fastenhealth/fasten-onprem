import { Injectable } from '@angular/core';
import { Client } from 'typesense';
import { SearchParams } from 'typesense/lib/Typesense/Types';
import { Observable, Subscriber } from 'rxjs';
import { SettingsService } from './settings.service';

const TYPESENSE_COLLECTION_RESOURCES = 'resources';
const TYPESENSE_COLLECTION_CONVERSATION_STORE = 'conversation_store';
const TYPESENSE_QUERY_BY_FIELD = 'embedding';
const TYPESENSE_CONVERSATION_MODEL_ID = 'conv-model-1';

export interface ResourceDocument {
  source_resource_type: string;
  sort_title: string;
  sort_date: BigInt;

  // Add other fields as they are used in search results or conversation context
  resource_raw?: {
    code?: { text?: string };
    recordedDate?: string;
    effectiveDateTime?: string;
    valueQuantity?: { unit?: string; value?: number };
  };
}

export interface ConversationDocument {
  conversation_id: string;
  id: string;
  message: string;
  model_id: string;
  role: 'user' | 'bot';
  timestamp: BigInt;
}

export interface TypesenseGroupedHit<T> {
  group_key: string[];
  hits: Array<{ document: T }>;
}

export interface TypesenseSearchResponse<T> {
  hits?: Array<{ document: T }>; // Made optional to match Typesense client's SearchResponse
  conversation?: {
    answer: string;
    conversation_id: string;
    // Add other conversation-related fields if they exist in the response
  };
}

export interface ConversationStreamChunk {
  message?: string;
  conversation_id?: string;
  // Add other chunk-specific fields if they exist
}

export interface ConversationStreamComplete {
  conversation?: {
    answer: string;
    conversation_id: string;
  };
  // Add other complete-specific fields if they exist
}

@Injectable({
  providedIn: 'root',
})
export class TypesenseService {
  private client: Client;

  constructor(private settingsService: SettingsService) {
    const searchSettings = this.settingsService.get('search');
    if (searchSettings) {
      const url = new URL(searchSettings.uri);
      const config = {
        nodes: [
          {
            host: globalThis.location.hostname,
            port: Number(url.port),
            protocol: url.protocol.replace(':', ''),
          },
        ],
        apiKey: searchSettings.api_key,
        connectionTimeoutSeconds: 180, // Default value
      };
      this.client = new Client(config);
    } else {
      console.error("Search configuration not found in settings");
    }
  }

  /**
   * Fetches a list of existing conversations, grouped by conversation_id.
   * @returns A promise that resolves to an array of grouped conversation hits.
   */
  async getConversations(): Promise<TypesenseGroupedHit<ConversationDocument>[]> {
    try {
      const searchParams: SearchParams<ConversationDocument> = {
        q: '*',
        query_by: 'conversation_id',
        group_by: 'conversation_id',
        group_limit: 1,
        sort_by: 'timestamp:desc',
        per_page: 250, // Max number of conversations to fetch
      };

      const response = await this.client
        .collections<ConversationDocument>(TYPESENSE_COLLECTION_CONVERSATION_STORE)
        .documents()
        .search(searchParams);

      return response.grouped_hits || [];
    } catch (error: any) {
      console.error('Error fetching conversations:', error.message);
      throw error;
    }
  }

  /**
   * Fetches all messages for a specific conversation ID.
   * @param conversationId The ID of the conversation to fetch messages for.
   * @returns A promise that resolves to an array of conversation document hits.
   */
  async getConversationMessages(
    conversationId: string
  ): Promise<Array<{ document: ConversationDocument }>> {
    try {
      const searchParams: SearchParams<ConversationDocument> = {
        q: '*',
        query_by: 'conversation_id',
        filter_by: `conversation_id:=${conversationId}`,
        sort_by: 'timestamp:asc',
        per_page: 250, // Max number of messages to fetch
      };

      const response = await this.client
        .collections<ConversationDocument>(TYPESENSE_COLLECTION_CONVERSATION_STORE)
        .documents()
        .search(searchParams);

      return response.hits || [];
    } catch (error: any) {
      console.error('Error fetching conversation messages:', error.message);
      throw error;
    }
  }

  /**
   * Starts a new conversation or continues an existing one without streaming.
   * @param query The user's message.
   * @param conversationId Optional ID of an existing conversation.
   * @returns A promise that resolves to the full conversation response.
   */
  async startConversation(
    query: string,
    conversationId?: string
  ): Promise<TypesenseSearchResponse<ResourceDocument>> {
    const include_fields = [
      'source_resource_type',
      'sort_title',
      'sort_date',
      'resource_raw.code.text',
      'resource_raw.recordedDate',
      'resource_raw.effectiveDateTime',
      'resource_raw.valueQuantity.unit',
      'resource_raw.valueQuantity.value',
    ];

    const searchParams: SearchParams<ResourceDocument> = {
      q: query,
      query_by: TYPESENSE_QUERY_BY_FIELD,
      conversation: true,
      conversation_model_id: TYPESENSE_CONVERSATION_MODEL_ID,
      include_fields: include_fields.join(','),
      ...(conversationId ? { conversation_id: conversationId } : {}),
    };

    try {
      return await this.client
        .collections<ResourceDocument>(TYPESENSE_COLLECTION_RESOURCES)
        .documents()
        .search(searchParams);
    } catch (error: any) {
      console.error('Error starting conversation:', error.message);
      throw error;
    }
  }

  /**
   * Starts a new conversation or continues an existing one with streaming.
   * Returns an Observable that emits chunks of the conversation response.
   * @param query The user's message.
   * @param conversationId Optional ID of an existing conversation.
   * @returns An Observable that emits ConversationStreamChunk objects.
   */
  startConversationStreaming(
    query: string,
    conversationId?: string
  ): Observable<ConversationStreamChunk> {
    return new Observable((subscriber: Subscriber<ConversationStreamChunk>) => {
      const include_fields = [
      'source_resource_type',
      'sort_title',
      'sort_date',
      'resource_raw.code.text',
      'resource_raw.recordedDate',
      'resource_raw.effectiveDateTime',
      'resource_raw.valueQuantity.unit',
      'resource_raw.valueQuantity.value',
    ];

      const searchParams: SearchParams<ResourceDocument> = {
        q: query,
        query_by: TYPESENSE_QUERY_BY_FIELD,
        conversation: true,
        conversation_model_id: TYPESENSE_CONVERSATION_MODEL_ID,
        conversation_stream: true,
        include_fields: include_fields.join(','),
        streamConfig: {
          onChunk: (result: ConversationStreamChunk) => {
            subscriber.next(result);
          },
          onComplete: (results: ConversationStreamComplete) => {
            // The last chunk might contain the full conversation object
            if (results && results.conversation) {
              subscriber.next({
                message: results.conversation.answer,
                conversation_id: results.conversation.conversation_id,
              });
            }
            subscriber.complete();
          },
          onError: (error: Error) => {
            subscriber.error(error);
          },
        },
        ...(conversationId ? { conversation_id: conversationId } : {}),
      };

      this.client
        .collections<ResourceDocument>(TYPESENSE_COLLECTION_RESOURCES)
        .documents()
        .search(searchParams)
        .catch((error) => {
          // Catch errors from the initial search call itself, not just stream errors
          subscriber.error(error);
        });
    });
  }

  /**
   * Deletes a conversation by its ID.
   * @param conversationId The ID of the conversation to delete.
   * @returns A promise that resolves when the conversation is deleted.
   */
  async deleteConversation(conversationId: string): Promise<void> {
    if (!conversationId) {
      console.warn('No conversation ID provided for deletion.');
      return;
    }
    try {
      await this.client
        .collections<ConversationDocument>(TYPESENSE_COLLECTION_CONVERSATION_STORE)
        .documents()
        .delete({ filter_by: `conversation_id:=${conversationId}` });
      console.log(`Conversation ${conversationId} deleted successfully.`);
    } catch (error: any) {
      console.error(`Error deleting conversation ${conversationId}:`, error.message);
      throw error;
    }
  }
}
