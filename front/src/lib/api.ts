// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  CHAT_MESSAGE: `${API_BASE_URL}/chat/message`,
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