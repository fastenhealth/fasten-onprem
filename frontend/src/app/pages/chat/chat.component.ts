import { Component, OnInit } from '@angular/core';
import { ConversationDocument, TypesenseService } from '../../services/typesense.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  messages: { text: string, sender: 'user' | 'bot' }[] = [];
  userMessage: string = '';
  conversationId: string | undefined;
  conversations: { conversation_id: string; firstMessage: string }[] = [];

  private readonly TYPESENSE_COLLECTION = 'resources';
  private readonly TYPESENSE_QUERY_BY_FIELD = 'embedding';
  private readonly TYPESENSE_CONVERSATION_MODEL_ID = 'conv-model-1';

  constructor(private typesenseService: TypesenseService) { }

  ngOnInit(): void {
    this.loadConversations();
  }

  async loadConversations(): Promise<void> {
    try {
      const groupedHits = await this.typesenseService.getConversations();
      this.conversations = groupedHits.map((group: any) => ({
        conversation_id: group.group_key[0],
        firstMessage: group.hits[0].document.message,
      }));
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }

  async selectConversation(conversationId: string): Promise<void> {
    this.conversationId = conversationId;
    this.messages = []; // Clear current messages

    try {
      const messages = await this.typesenseService.getConversationMessages(conversationId);
      this.messages = messages.map((hit: any) => ({
        text: hit.document.message,
        sender: hit.document.role,
      }));
    } catch (error) {
      console.error('Error loading conversation messages:', error);
      this.messages.push({ text: 'Error: Could not load conversation.', sender: 'bot' });
    }
  }

  newChat(): void {
    this.conversationId = undefined;
    this.messages = [];
  }

  async deleteConversation(conversationIdToDelete: string): Promise<void> {
    await this.typesenseService.deleteConversation(conversationIdToDelete);
    if (this.conversationId === conversationIdToDelete) {
      this.conversationId = undefined;
      this.messages = [];
    }
    await this.loadConversations(); // Reload conversations to reflect deletion
  }

  async sendMessage(): Promise<void> {
    if (this.userMessage.trim() === '') {
      return;
    }

    const messageText = this.userMessage;
    this.messages.push({ text: messageText, sender: 'user' });
    this.userMessage = '';

    try {
      const conversationResponse = await this.typesenseService.startConversation(
        messageText,
        this.TYPESENSE_COLLECTION,
        this.TYPESENSE_CONVERSATION_MODEL_ID,
        this.TYPESENSE_QUERY_BY_FIELD,
        this.conversationId
      );

      const botAnswer = conversationResponse.answer;
      this.conversationId = conversationResponse.conversation_id;
      this.messages.push({ text: botAnswer, sender: 'bot' });
      this.loadConversations(); // Reload conversations to show the new one

    } catch (error) {
      console.error('Error sending message:', error);
      this.messages.push({ text: 'Error: Could not get a response.', sender: 'bot' });
    }
  }

  _sendMessage(): Promise<void> {
    if (this.userMessage.trim() === '') {
      return;
    }

    const messageText = this.userMessage;
    this.messages.push({ text: messageText, sender: 'user' });
    this.userMessage = '';

    const botMessageIndex = this.messages.length;
    this.messages.push({ text: '', sender: 'bot' }); // Placeholder for streaming response

    try {
      this.typesenseService.startConversationStreaming(
        messageText,
        this.TYPESENSE_COLLECTION,
        this.TYPESENSE_QUERY_BY_FIELD,
        {
          onChunk: (result: any) => {
            if (result && result.message) {
              this.messages[botMessageIndex].text += result.message;
            }
            if (result && result.conversation_id) {
              this.conversationId = result.conversation_id;
            }
          },
          onComplete: (results: any) => {
            if (results && results.conversation && results.conversation.answer) {
              this.messages[botMessageIndex].text = results.conversation.answer;
            }
            if (results && results.conversation && results.conversation.conversation_id) {
              this.conversationId = results.conversation.conversation_id;
            }
            this.loadConversations(); // Reload conversations to show the new one
          },
          onError: (error: Error) => {
            console.log(`onError`, { error });
            // console.error("Error during conversation stream:", error);
            // setIsPending(false);
          },
        },
        this.TYPESENSE_CONVERSATION_MODEL_ID,
        this.conversationId
      );

    } catch (error) {
      console.error('Error sending message:', error);
      this.messages[botMessageIndex].text = 'Error: Could not get a response.';
    }
  }
}
