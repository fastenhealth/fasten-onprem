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
