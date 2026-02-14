import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConversationDocument, TypesenseService, TypesenseGroupedHit } from '../../services/typesense.service';

export interface Message {
  text: string;
  sender: 'user' | 'bot';
}

export interface Conversation {
  conversation_id: string;
  firstMessage: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatStateService {
  messages = new BehaviorSubject<Message[]>([]);
  conversations = new BehaviorSubject<Conversation[]>([]);
  currentConversationId = new BehaviorSubject<string | undefined>(undefined);

  constructor(private typesenseService: TypesenseService) {}

  /**
   * Loads all conversations from Typesense and updates the state.
   */
  async loadConversations(): Promise<void> {
    try {
      const groupedHits: TypesenseGroupedHit<ConversationDocument>[] = await this.typesenseService.getConversations();
      const conversations = groupedHits.map((group: TypesenseGroupedHit<ConversationDocument>) => ({
        conversation_id: group.group_key[0],
        firstMessage: group.hits[0].document.message,
      }));
      this.conversations.next(conversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      // Optionally, handle error state for UI
    }
  }

  /**
   * Selects a conversation and loads its messages.
   * @param conversationId The ID of the conversation to select.
   */
  async selectConversation(conversationId: string): Promise<void> {
    this.currentConversationId.next(conversationId);
    this.messages.next([]); // Clear current messages

    try {
      const messages = await this.typesenseService.getConversationMessages(conversationId);
      const formattedMessages: Message[] = messages.map((hit: { document: ConversationDocument }) => ({
        text: hit.document.message,
        sender: hit.document.role,
      }));
      this.messages.next(formattedMessages);
    } catch (error) {
      console.error('Error loading conversation messages:', error);
      this.messages.next([{ text: 'Error: Could not load conversation.', sender: 'bot' }]);
    }
  }

  /**
   * Starts a new conversation by clearing the current conversation ID and messages.
   */
  newConversation(): void {
    this.currentConversationId.next(undefined);
    this.messages.next([]);
  }

  /**
   * Deletes a conversation and updates the state.
   * If the deleted conversation was the currently active one, it clears the current conversation.
   * @param conversationIdToDelete The ID of the conversation to delete.
   */
  async deleteConversation(conversationIdToDelete: string): Promise<void> {
    try {
      await this.typesenseService.deleteConversation(conversationIdToDelete);
      if (this.currentConversationId.getValue() === conversationIdToDelete) {
        this.newConversation(); // Clear current conversation if it was deleted
      }
      // Update conversations list by filtering out the deleted one
      const updatedConversations = this.conversations.getValue().filter(
        (conv) => conv.conversation_id !== conversationIdToDelete
      );
      this.conversations.next(updatedConversations);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      // Optionally, handle error state for UI
    }
  }

  /**
   * Adds a user message to the current conversation state.
   * @param text The text of the user message.
   */
  addUserMessage(text: string): void {
    const currentMessages = this.messages.getValue();
    this.messages.next([...currentMessages, { text, sender: 'user' }]);
  }

  /**
   * Adds a bot message (or placeholder) to the current conversation state.
   * Returns the index of the added message for potential updates (e.g., streaming).
   * @param text The initial text of the bot message (can be empty for streaming).
   * @returns The index of the newly added bot message.
   */
  addBotMessage(text: string = ''): number {
    const currentMessages = this.messages.getValue();
    this.messages.next([...currentMessages, { text, sender: 'bot' }]);
    return this.messages.getValue().length - 1;
  }

  /**
   * Updates a specific bot message in the state.
   * @param index The index of the message to update.
   * @param newText The new text for the message.
   */
  updateBotMessage(index: number, newText: string): void {
    const currentMessages = this.messages.getValue();
    if (index >= 0 && index < currentMessages.length) {
      const updatedMessages = [...currentMessages];
      updatedMessages[index] = { ...updatedMessages[index], text: newText };
      this.messages.next(updatedMessages);
    }
  }

  /**
   * Sets the current conversation ID.
   * @param conversationId The new conversation ID.
   */
  setCurrentConversationId(conversationId: string): void {
    this.currentConversationId.next(conversationId);
    // After setting a new conversation ID, ensure it appears in the conversations list
    // This is a simplified approach; a more robust solution might involve checking if it exists
    // and adding it if not, or re-loading conversations if the new one isn't in the list.
    this.loadConversations();
  }
}
