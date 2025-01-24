export interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: number;
  status: 'recording' | 'processing' | 'playing' | 'complete';
  audioUrl?: string;
}

export interface ChatState {
  messages: Message[];
  isProcessing: boolean;
  error: string | null;
}