import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import {
  getConversation,
  sendMessage as sendApiMessage,
  createConversation as createApiConversation,
  getAllConversations,
} from "../lib/api";
import type { ChatMessage, Conversation } from "../lib/api";

export function useChat(conversationId: string | null) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(conversationId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Fetch all conversation stubs for the sidebar */
  const fetchConversations = useCallback(async () => {
    try {
      const data = await getAllConversations();
      setConversations(data || []);

      // If no active conversation yet, default to the first one from the server
      if (!activeConversationId && data.length > 0) {
        setActiveConversationId(data[0].id);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.message || "Failed to load conversations.");
      }
    }
  }, [activeConversationId]);

  /** Fetch messages for the active conversation */
  const fetchMessages = useCallback(async () => {
    if (!activeConversationId) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await getConversation(activeConversationId);
      setMessages(data || []);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setMessages([]);
        } else {
          setError(err.message || "Failed to fetch messages.");
        }
      } else {
        setError(String(err));
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeConversationId]);

  // On mount: load all conversations, then load messages for the active one
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  /** Create a new conversation and switch to it */
  const createConversation = useCallback(async () => {
    try {
      const newId = await createApiConversation();
      setActiveConversationId(newId);
      setMessages([]);
      await fetchConversations(); // refresh sidebar list
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.message || "Failed to create conversation.");
      }
    }
  }, [fetchConversations]);

  /** Send a message — optimistic UI update, then append real assistant reply */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading || !activeConversationId) return;

      const tempUserMessage: ChatMessage = {
        role: "user",
        content,
        conversation_id: activeConversationId,
      };

      setMessages((prev) => [...prev, tempUserMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const response = await sendApiMessage(activeConversationId, content);
        setMessages((prev) => [...prev, response.message]);

        // Refresh sidebar so title updates after the first message
        await fetchConversations();
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(err.message || "Failed to send message.");
        } else {
          setError(String(err));
        }
        // Roll back the optimistic user message on failure
        setMessages((prev) => prev.filter((m) => m !== tempUserMessage));
      } finally {
        setIsLoading(false);
      }
    },
    [activeConversationId, isLoading, fetchConversations]
  );

  return {
    messages,
    conversations,
    activeConversationId,
    isLoading,
    error,
    sendMessage,
    createConversation,
    switchConversation: setActiveConversationId,
    refetch: fetchMessages,
  };
}
