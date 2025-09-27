import { useState, useCallback } from 'react';
import { API_ENDPOINTS, apiCall, ChatMessageRequest, ChatMessageResponse } from '@/lib/api';

export interface UseChatApiReturn {
  sessionId: string | null;
  isLoading: boolean;
  setSessionId: (sessionId: string) => void;
  initializeChat: () => Promise<string>;
  sendMessage: (message: string, currentSessionId?: string | null) => Promise<{
    message: string;
    sessionId: string;
  }>;
}

export const useChatApi = (): UseChatApiReturn => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const initializeChat = useCallback(async (): Promise<string> => {
    setIsLoading(true);
    try {
      const requestBody: ChatMessageRequest = {
        message: '', // Empty message to initialize the chat
      };

      const data = await apiCall<ChatMessageResponse>(API_ENDPOINTS.CHAT_MESSAGE, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (data.session_id) {
        setSessionId(data.session_id);
      }

      return data.message;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (
    message: string, 
    currentSessionId?: string | null
  ): Promise<{ message: string; sessionId: string }> => {
    setIsLoading(true);
    try {
      const requestBody: ChatMessageRequest = {
        message,
      };

      // Use provided sessionId or the stored one
      const sessionToUse = currentSessionId || sessionId;
      if (sessionToUse) {
        requestBody.session_id = sessionToUse;
      }

      const data = await apiCall<ChatMessageResponse>(API_ENDPOINTS.CHAT_MESSAGE, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      // Update session_id if received
      if (data.session_id) {
        setSessionId(data.session_id);
      }

      return {
        message: data.message,
        sessionId: data.session_id,
      };
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  return {
    sessionId,
    isLoading,
    setSessionId,
    initializeChat,
    sendMessage,
  };
};