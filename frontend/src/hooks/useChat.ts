import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { getConversation, sendMessage as sendApiMessage } from "../lib/api";
import type { ChatMessage } from "../lib/api";

export function useChat(conversationId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getConversation(conversationId);
      setMessages(data || []);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          // If it's a 404 for conversation not found, we can start with empty messages
          setMessages([]);
        } else {
          setError(err.message || "Failed to fetch messages.");
        }
      } else {
        setError(String(err) || "Failed to fetch messages.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const tempUserMessage: ChatMessage = {
      role: "user",
      content,
      conversation_id: conversationId,
    };

    setMessages((prev) => [...prev, tempUserMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendApiMessage(conversationId, content);
      setMessages((prev) => [...prev, response.message]);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.message || "Failed to send message.");
      } else {
        setError(String(err));
      }
      // Optionally remove the optimistically added message if it fails
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, isLoading]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    refetch: fetchMessages,
  };
}
