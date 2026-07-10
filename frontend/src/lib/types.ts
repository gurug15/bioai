export type User = {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
};

export type Message = { role: string; content: string; conversation_id: string };

export type Conversation = { id: string; title: string; user_id: string };
