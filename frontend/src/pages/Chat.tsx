import React, { useState, useEffect, useRef } from "react"
import {
  Send,
  User,
  Bot,
  Loader2,
  Menu,
  Plus,
  MessageSquare,
} from "lucide-react"

import { Button } from "../components/ui/button"
import { ScrollArea } from "../components/ui/scroll-area"
import { Avatar, AvatarFallback } from "../components/ui/avatar"

import { useChat } from "../hooks/useChat"

export default function Chat() {
  const {
    messages,
    conversations,
    activeConversationId,
    isLoading,
    error,
    sendMessage,
    createConversation,
    switchConversation,
  } = useChat(null) // null → hook auto-selects first conversation from server

  const [input, setInput] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isLoading])

  // Re-focus the textarea after isLoading flips to false —
  // done in an effect so React has already re-enabled the element before we focus it.
  useEffect(() => {
    if (!isLoading) {
      textareaRef.current?.focus()
    }
  }, [isLoading])

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return
    const messageContent = input.trim()
    setInput("")
    // Reset textarea height back to one row
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
    await sendMessage(messageContent)
  }

  const handleNewChat = async () => {
    await createConversation()
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#212121] text-zinc-100">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-64" : "w-0"} flex shrink-0 flex-col overflow-hidden border-r border-zinc-800 bg-[#171717] transition-all duration-300 ease-in-out`}
      >
        <div className="p-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-zinc-200 hover:bg-zinc-800"
            onClick={handleNewChat}
          >
            <Plus size={16} />
            New chat
          </Button>
        </div>
        <ScrollArea className="flex-1 px-3">
          <div className="flex flex-col gap-1 py-2">
            <p className="mb-2 px-2 text-xs font-semibold text-zinc-500">
              Today
            </p>
            {conversations.map((conv) => (
              <Button
                key={conv.id}
                variant="ghost"
                className={`w-full justify-start gap-3 truncate ${
                  conv.id === activeConversationId
                    ? "bg-zinc-800 text-zinc-200"
                    : "text-zinc-400 hover:bg-zinc-800"
                }`}
                onClick={() => switchConversation(conv.id)}
              >
                <MessageSquare size={16} />
                <span className="truncate">{conv.title}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex h-full min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          >
            <Menu size={20} />
          </Button>
          <div className="text-lg font-semibold">BioAI Assistant</div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-auto w-full max-w-3xl px-4 py-2">
            <div className="rounded-lg bg-red-900/40 px-4 py-2 text-sm text-red-300">
              {error}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <ScrollArea className="flex-1 overflow-auto">
          <div className="mx-auto flex w-full max-w-3xl flex-col pb-6">
            {messages.length === 0 && !isLoading && (
              <div className="mt-32 flex flex-col items-center justify-center text-zinc-500">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
                  <Bot size={32} className="text-zinc-400" />
                </div>
                <h2 className="mb-2 text-2xl font-semibold text-zinc-200">
                  How can I help you today?
                </h2>
              </div>
            )}

            {messages.map((msg, index) => (
              <div key={index} className="w-full px-4 py-6">
                <div className="mx-auto flex max-w-3xl gap-4">
                  <Avatar className="mt-0.5 h-8 w-8 shrink-0">
                    <AvatarFallback
                      className={
                        msg.role === "user" ? "bg-indigo-600" : "bg-emerald-600"
                      }
                    >
                      {msg.role === "user" ? (
                        <User size={16} className="text-white" />
                      ) : (
                        <Bot size={16} className="text-white" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="wrap-break-words min-w-0 flex-1 leading-relaxed">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="w-full px-4 py-6">
                <div className="mx-auto flex max-w-3xl gap-4">
                  <Avatar className="mt-0.5 h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-emerald-600">
                      <Bot size={16} className="text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 items-center text-zinc-400">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Thinking...
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} className="h-4" />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="mx-auto w-full max-w-3xl shrink-0 px-4 pt-2 pb-6">
          <form
            onSubmit={handleSend}
            className="relative flex items-end overflow-hidden rounded-2xl border border-white/10 bg-[#2f2f2f] shadow-lg transition-colors focus-within:border-white/20"
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                e.target.style.height = "auto"
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 200) + "px"
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Message BioAI..."
              className="max-h-[200px] w-full resize-none overflow-y-auto bg-transparent py-4 pr-12 pl-4 text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
              disabled={isLoading || !activeConversationId}
              rows={1}
              style={{ minHeight: "56px" }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading || !activeConversationId}
              className="absolute right-2 bottom-2 h-10 w-10 rounded-xl bg-white text-black hover:bg-zinc-200 disabled:bg-white/10 disabled:text-white disabled:opacity-30"
            >
              <Send size={18} />
            </Button>
          </form>
          <div className="mt-3 text-center text-xs text-zinc-500">
            BioAI can make mistakes. Consider verifying important information.
          </div>
        </div>
      </div>
    </div>
  )
}
