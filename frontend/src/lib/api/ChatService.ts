import { ApiClient, ApiResponse } from './Client';
import { Message, Conversation, SendMessageRequest } from '@/types/Chat';
import { TokenManager } from './TokenManager';

export class ChatService {
  private client: ApiClient;

  constructor(apiClient?: ApiClient) {
    this.client = apiClient || new ApiClient();
  }

  private getAuthHeaders(): Record<string, string> | undefined {
    const token = TokenManager.getToken();
    if (!token) return undefined;
    
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  async getConversations(): Promise<ApiResponse<Conversation[]>> {
    return this.client.get<Conversation[]>('/api/chat/sidebar/', this.getAuthHeaders());
  }

  async getMessages(userId: number): Promise<ApiResponse<Message[]>> {
    return this.client.get<Message[]>(`/api/chat/conversation/?id=${userId}`, this.getAuthHeaders());
  }

  async sendMessage(data: SendMessageRequest): Promise<ApiResponse<void>> {
    return this.client.post<void>('/api/chat/msg/', data, this.getAuthHeaders());
  }
}

const chatService = new ChatService();
export default chatService; 