import { Component, OnInit, OnDestroy } from '@angular/core';
import { TypesenseService } from '../../services/typesense.service';
import { ChatStateService, Message, Conversation } from './chat-state.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  userMessage: string = '';
  messages: Observable<Message[]>;
  conversations: Observable<Conversation[]>;
  currentConversationId: Observable<string | undefined>;

  private subscriptions = new Subscription();

  // Configuration for chat behavior
  private readonly USE_STREAMING_CHAT = false; // Toggle between streaming and non-streaming

  constructor(
    private typesenseService: TypesenseService,
    public chatStateService: ChatStateService // Made public for template access
  ) {
    this.messages = this.chatStateService.messages.asObservable();
    this.conversations = this.chatStateService.conversations.asObservable();
    this.currentConversationId = this.chatStateService.currentConversationId.asObservable();
  }

  ngOnInit(): void {
    this.chatStateService.loadConversations();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Handles sending a message, choosing between streaming and non-streaming based on configuration.
   */
  async sendMessage(): Promise<void> {
    if (this.userMessage.trim() === '') {
      return;
    }

    const messageText = this.userMessage;
    this.chatStateService.addUserMessage(messageText);
    this.userMessage = ''; // Clear input immediately

    const currentConversationId = this.chatStateService.currentConversationId.getValue();

    if (this.USE_STREAMING_CHAT) {
      this.sendStreamingMessage(messageText, currentConversationId);
    } else {
      await this.sendNonStreamingMessage(messageText, currentConversationId);
    }
  }

  /**
   * Sends a message and handles the streaming response.
   * @param messageText The user's message.
   * @param conversationId The current conversation ID, if any.
   */
  private sendStreamingMessage(messageText: string, conversationId?: string): void {
    const botMessageIndex = this.chatStateService.addBotMessage(''); // Add placeholder

    this.subscriptions.add(
      this.typesenseService.startConversationStreaming(messageText, conversationId).subscribe({
        next: (chunk) => {
          if (chunk.message) {
            this.chatStateService.updateBotMessage(
              botMessageIndex,
              this.chatStateService.messages.getValue()[botMessageIndex].text + chunk.message
            );
          }
          if (chunk.conversation_id && !this.chatStateService.currentConversationId.getValue()) {
            this.chatStateService.setCurrentConversationId(chunk.conversation_id);
          }
        },
        error: (error) => {
          console.error('Error during conversation stream:', error);
          this.chatStateService.updateBotMessage(
            botMessageIndex,
            'Error: Could not get a response.'
          );
        },
        complete: () => {
          // On complete, ensure the conversation list is updated if a new conversation was started
          this.chatStateService.loadConversations();
        },
      })
    );
  }

  /**
   * Sends a message and waits for the complete response.
   * @param messageText The user's message.
   * @param conversationId The current conversation ID, if any.
   */
  private async sendNonStreamingMessage(messageText: string, conversationId?: string): Promise<void> {
    try {
      const conversationResponse = await this.typesenseService.startConversation(
        messageText,
        conversationId
      );

      const botAnswer = conversationResponse.conversation?.answer || 'No answer received.';
      const newConversationId = conversationResponse.conversation?.conversation_id;

      if (newConversationId) {
        this.chatStateService.setCurrentConversationId(newConversationId);
      }
      this.chatStateService.addBotMessage(botAnswer);
      this.chatStateService.loadConversations(); // Reload conversations to show the new one
    } catch (error) {
      console.error('Error sending message:', error);
      this.chatStateService.addBotMessage('Error: Could not get a response.');
    }
  }

  /**
   * Selects an existing conversation.
   * @param conversationId The ID of the conversation to select.
   */
  selectConversation(conversationId: string): void {
    this.chatStateService.selectConversation(conversationId);
  }

  /**
   * Starts a new conversation.
   */
  newConversation(): void {
    this.chatStateService.newConversation();
  }

  /**
   * Deletes a conversation.
   * @param conversationIdToDelete The ID of the conversation to delete.
   */
  deleteConversation(conversationIdToDelete: string): void {
    this.chatStateService.deleteConversation(conversationIdToDelete);
  }
}
