// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  CHAT_MESSAGE: `${API_BASE_URL}/chat/message`,
  GET_USER_CONVERSATIONS: (phoneNumber: string) => `${API_BASE_URL}/chat/${phoneNumber}`,
  CREATE_NEW_CHAT: `${API_BASE_URL}/chat/`,
  GET_CHAT_MESSAGES: (sessionId: string) => `${API_BASE_URL}/chat/messages/${sessionId}`,
  GET_TRIAGE_SUMMARY: (sessionId: string) => `${API_BASE_URL}/chat/triage/${sessionId}`,
} as const;

// Request body types
export interface ChatMessageRequest {
  message: string;
  session_id?: string;
}

export interface ChatMessageResponse {
  message: string;
  session_id: string;
}

export interface CreateChatRequest {
  numero_paciente: string;
}

export interface CreateChatResponse {
  session_id: string;
}

export interface Conversation {
  session_id: string;
  timestamp: string;
  last_message: string;
  // Add other conversation properties as needed
}

export interface ChatMessage {
  cargo: 'system' | 'user' | 'ai';
  body: string;
  timestamp: string;
}

export interface TriageSummary {
  main_complaint: string | null;
  symptoms: string | null;
  duration: string | null;
  frequency: string | null;
  intensity: string | null;
  history: string | null;
  measures_taken: string | null;
}

// API utility functions
export const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Utility function to convert API messages to internal message format
export const convertApiMessagesToInternal = (apiMessages: ChatMessage[]) => {
  return apiMessages
    .filter(msg => msg.cargo !== 'system') // Filter out system messages
    .map((msg, index) => ({
      id: `msg-${index}`,
      content: msg.body,
      isUser: msg.cargo === 'user',
      timestamp: new Date(msg.timestamp),
      isEmergency: msg.body.includes('⚠️') || 
                  msg.body.toLowerCase().includes('emergência') ||
                  msg.body.toLowerCase().includes('imediatamente') ||
                  msg.body.toLowerCase().includes('samu')
    }));
};

// Utility function to process triage summary, replacing null values
export const processTriageSummary = (summary: TriageSummary): Record<string, string> => {
  return {
    main_complaint: summary.main_complaint || 'Não informado',
    symptoms: summary.symptoms || 'Não informado',
    duration: summary.duration || 'Não informado',
    frequency: summary.frequency || 'Não informado',
    intensity: summary.intensity || 'Não informado',
    history: summary.history || 'Não informado',
    measures_taken: summary.measures_taken || 'Não informado',
  };
};