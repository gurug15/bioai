import axios from "axios";

export interface ChatMessage {
  role: "tool" | "user" | "assistant";
  conversation_id: string;
  content: string;
}

export interface ChatResponse {
  conversation_id: string;
  message: ChatMessage;
}

export const apiClient = axios.create({
  baseURL: "http://localhost:5555/api",
  timeout: 10000,
});

// Axios Interceptors for Request and Response
apiClient.interceptors.request.use(
  (config) => {
    // Modify request config here (e.g., attach auth tokens)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle global errors here
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export const getConversation = async (conversationId: string): Promise<ChatMessage[]> => {
  const response = await apiClient.get(`/chat/conv/${conversationId}`);
  return response.data.ChatMessages;
};

export const sendMessage = async (conversationId: string, message: string): Promise<ChatResponse> => {
  const response = await apiClient.post(`/chat/`, {
    conversation_id: conversationId,
    message,
  });
  return response.data;
};
