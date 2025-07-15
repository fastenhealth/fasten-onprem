import { Injectable } from '@angular/core';
import { Client } from 'typesense';
import { SearchParams } from 'typesense/lib/Typesense/Types';

export interface ResourceDocument {
  source_resource_type: string;
  sort_title: string;
  sort_date: BigInt;
}

export interface ConversationDocument {
  conversation_id: string,
  id: string,
  message: string,
  model_id: string,
  role: string,
  timestamp: BigInt;
}

@Injectable({
  providedIn: 'root',
})
export class TypesenseService {
  private client: Client;

  constructor() {
    this.client = new Client({
      nodes: [
        {
          host: 'localhost',
          port: 8108,
          protocol: 'http',
        },
      ],
      connectionTimeoutSeconds: 180,
      apiKey: 'xyz123',
    });
  }

  async getConversations(): Promise<any> {
    try {
      const searchParams: SearchParams<ConversationDocument> = {
        q: '*',
        query_by: 'conversation_id',
        group_by: 'conversation_id',
        group_limit: 1,
        sort_by: 'timestamp:desc',
        per_page: 250,
      };

      const response = await this.client
        .collections<ConversationDocument>('conversation_store')
        .documents()
        .search(searchParams);

      return response.grouped_hits;
    } catch (error) {
      console.error('Error fetching conversations:', error.message);
      throw error;
    }
  }

  async getConversationMessages(conversationId: string): Promise<any> {
    try {
      const searchParams: SearchParams<ConversationDocument> = {
        q: '*',
        query_by: 'conversation_id', // Using conversation_id as it's indexed
        filter_by: `conversation_id:=${conversationId}`,
        // sort_by: 'timestamp:asc,id:asc', // Added secondary sort by id
        sort_by: 'timestamp:asc', // Added secondary sort by id
        per_page: 250, // Max number of messages to fetch
      };

      const response = await this.client
        .collections<ConversationDocument>('conversation_store')
        .documents()
        .search(searchParams);

      return response.hits;
    } catch (error) {
      console.error('Error fetching conversation messages:', error.message);
      throw error;
    }
  }

  async startConversation(
    query: string,
    collection: string,
    conversationModelId: string,
    queryBy: string,
    conversationId?: string
  ): Promise<any> {
    const searchRequests = {
      searches: [
        {
          collection: collection,
          query_by: queryBy,
          include_fields: 'source_resource_type,sort_title,sort_date',
          // exclude_fields: 'embedding'
        },
      ],
    };

    const commonParams: any = {
      q: query,
      conversation: true,
      conversation_model_id: conversationModelId,
    };

    if (conversationId) {
      commonParams.conversation_id = conversationId;
    }

    try {
      const response: any = await this.client.multiSearch.perform(
        searchRequests,
        commonParams
      );
      return response.conversation;
    } catch (error) {
      console.error('Error starting conversation:', error.message);
      throw error;
    }
  }

  async startConversationStreaming(
    q: string,
    collection: string,
    query_by: string,
    streamConfig: {
      onChunk: (result: any) => void;
      onComplete: (results: any) => void;
      onError: (error: Error) => void;
    },
    conversation_model_id: string,
    conversation_id?: string
  ) {
    try {
      const searchParams: SearchParams<ResourceDocument> = {
        q,
        query_by,
        conversation: true,
        conversation_model_id,
        conversation_stream: true,
        include_fields: 'source_resource_type,sort_title,sort_date',
        // exclude_fields: "embedding",
        streamConfig,

        ...(conversation_id ? { conversation_id } : {}),
      };

      await this.client
        .collections<ResourceDocument>(collection)
        .documents()
        .search(searchParams);
    } catch (error) {
      console.error('Error starting conversation streaming:', error.message);
      throw error;
    }
  }
}
