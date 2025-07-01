import { Component, OnInit } from '@angular/core';
import { TypesenseService } from '../../services/typesense.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  messages: { text: string, sender: 'user' | 'bot' }[] = [];
  userMessage: string = '';
  conversationId: string | undefined;

  private readonly TYPESENSE_COLLECTION = 'resources';
  private readonly TYPESENSE_CONVERSATION_MODEL_ID = 'conv-model-1';
  private readonly TYPESENSE_QUERY_BY_FIELD = 'embedding';

  constructor(private typesenseService: TypesenseService) { }

  ngOnInit(): void {
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

    } catch (error) {
      console.error('Error sending message:', error);
      this.messages.push({ text: 'Error: Could not get a response.', sender: 'bot' });
    }
  }
}
