import { Injectable } from '@angular/core';
import { Client } from 'typesense';

@Injectable({
  providedIn: 'root'
})
export class TypesenseService {
  private client: Client;

  constructor() {
    this.client = new Client({
      nodes: [{
        host: 'localhost',
        port: 8108,
        protocol: 'http'
      }],
      apiKey: 'xyz123',
      connectionTimeoutSeconds: 2
    });
  }

  async startConversation(query: string, collection: string, conversationModelId: string, queryBy: string, conversationId?: string): Promise<any> {
    const searchRequests = {
      searches: [
        {
          collection: collection,
          query_by: queryBy,
          exclude_fields: 'embedding'
        }
      ]
    };

    const commonParams: any = {
      q: query,
      conversation: true,
      conversation_model_id: conversationModelId
    };

    if (conversationId) {
      commonParams.conversation_id = conversationId;
    }

    try {
      const response: any = await this.client.multiSearch.perform(searchRequests, commonParams);
      return response.results[0].conversation;
    } catch (error) {
      console.error('Error starting conversation:', error);
      throw error;
    }
  }
}
