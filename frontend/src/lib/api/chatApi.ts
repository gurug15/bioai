import { apiClient } from "./client"

export interface ChatMessage {
  role: "user" | "assistant"
  conversation_id: string
  content: string
}

export interface ChatResponse {
  conversation_id: string
  message: ChatMessage
}

export interface Conversation {
  id: string
  user_id: string
  title: string
}

/** GET /chat/conv/:id — fetch all messages in a conversation */
export const getConversation = async (
  conversationId: string
): Promise<ChatMessage[]> => {
  const response = await apiClient.get(`/chat/conv/${conversationId}`)
  return response.data.messages
}

/** POST /chat/ — send a message and get the assistant reply */
export const sendMessage = async (
  conversationId: string,
  message: string
): Promise<ChatResponse> => {
  const response = await apiClient.post(`/chat/`, {
    conversation_id: conversationId,
    message,
  })
  return response.data
}

/** POST /chat/conv — create a new conversation, returns { conversation_id } */
export const createConversation = async (): Promise<string> => {
  const response = await apiClient.post(`/chat/conv`)
  return response.data.conversation_id
}

export const deleteConversation = async (
  conversation_id: string
): Promise<string> => {
  const response = await apiClient.delete(`/chat/conv`, {
    params: { conversation_id: conversation_id },
  })
  return response.data.conversation_id
}

/** GET /chat/allconv — list all conversations (without messages) */
export const getAllConversations = async (): Promise<Conversation[]> => {
  const response = await apiClient.get(`/chat/allconv`)
  return response.data
}
