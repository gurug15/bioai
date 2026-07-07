import React, { useState, useEffect, useRef } from "react";
import { Send, User, Bot, Loader2, Menu, Plus, MessageSquare } from "lucide-react";


import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import { Avatar, AvatarFallback } from "../components/ui/avatar";

import { useChat } from "../hooks/useChat";

export default function Chat() {
  const conversationId = "1"; // Hardcoded for now per user request
  const { messages, isLoading, sendMessage } = useChat(conversationId);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const messageContent = input.trim();
    setInput("");
    await sendMessage(messageContent);
  };

  return (
    <div className="flex h-screen w-full bg-[#212121] text-zinc-100 overflow-hidden">
      {/* Sidebar */}
      <div 
        className={`${sidebarOpen ? "w-64" : "w-0"} transition-all duration-300 ease-in-out bg-[#171717] border-r border-zinc-800 flex flex-col overflow-hidden shrink-0`}
      >
        <div className="p-3">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 hover:bg-zinc-800 text-zinc-200"
            onClick={() => {
              // Later: trigger new conversation
            }}
          >
            <Plus size={16} />
            New chat
          </Button>
        </div>
        <ScrollArea className="flex-1 px-3">
          <div className="flex flex-col gap-1 py-2">
            <p className="text-xs font-semibold text-zinc-500 mb-2 px-2">Today</p>
            <Button variant="ghost" className="w-full justify-start gap-3 bg-zinc-800 text-zinc-200 truncate">
              <MessageSquare size={16} />
              <span className="truncate">Conversation 1</span>
            </Button>
            {/* Mocked past conversations */}
            <Button variant="ghost" className="w-full justify-start gap-3 text-zinc-400 hover:bg-zinc-800 truncate">
              <MessageSquare size={16} />
              <span className="truncate">React Frontend Help</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-zinc-400 hover:bg-zinc-800 truncate">
              <MessageSquare size={16} />
              <span className="truncate">Python Backend Setup</span>
            </Button>
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Header */}
        <div className="h-14 flex items-center px-4 shrink-0">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 mr-2"
          >
            <Menu size={20} />
          </Button>
          <div className="font-semibold text-lg">AI Assistant</div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1">
          <div className="flex flex-col w-full max-w-3xl mx-auto pb-6">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center text-zinc-500 mt-32">
                <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                  <Bot size={32} className="text-zinc-400" />
                </div>
                <h2 className="text-2xl font-semibold text-zinc-200 mb-2">How can I help you today?</h2>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className="w-full py-6 px-4"
              >
                <div className="flex gap-4 max-w-3xl mx-auto">
                  <Avatar className="h-8 w-8 mt-0.5 shrink-0">
                    <AvatarFallback className={msg.role === "user" ? "bg-indigo-600" : "bg-emerald-600"}>
                      {msg.role === "user" ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 break-words leading-relaxed">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="w-full py-6 px-4">
                <div className="flex gap-4 max-w-3xl mx-auto">
                  <Avatar className="h-8 w-8 mt-0.5 shrink-0">
                    <AvatarFallback className="bg-emerald-600">
                      <Bot size={16} className="text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 flex items-center text-zinc-400">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Thinking...
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} className="h-4" />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="w-full max-w-3xl mx-auto px-4 pb-6 pt-2 shrink-0">
          <form
            onSubmit={handleSend}
            className="relative flex items-end bg-[#2f2f2f] rounded-2xl border border-white/10 shadow-lg overflow-hidden focus-within:border-white/20 transition-colors"
          >
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message AI Assistant..."
              className="w-full max-h-[200px] bg-transparent py-4 pl-4 pr-12 text-zinc-100 placeholder:text-zinc-500 focus:outline-none resize-none overflow-y-auto"
              disabled={isLoading}
              rows={1}
              style={{ minHeight: "56px" }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-2 h-10 w-10 rounded-xl bg-white text-black hover:bg-zinc-200 disabled:opacity-30 disabled:bg-white/10 disabled:text-white"
            >
              <Send size={18} />
            </Button>
          </form>
          <div className="text-center text-xs text-zinc-500 mt-3">
            AI Assistant can make mistakes. Consider verifying important information.
          </div>
        </div>
      </div>
    </div>
  );
}
