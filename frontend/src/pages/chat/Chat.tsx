import { useChat } from "@/hooks/useChat"
import { useEffect, useRef, useState } from "react"
import { ChatSidebar } from "./ChatSidebar"
import { ChatHeader } from "./ChatHeader"
import { MessageList } from "./MessageList"
import { ChatInput } from "./ChatInput"

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
  } = useChat(null)

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

  // Re-focus the textarea after isLoading flips to false
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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#212121] text-zinc-100">
      <ChatSidebar
        isOpen={sidebarOpen}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewChat={createConversation}
        onSwitchConversation={switchConversation}
      />

      {/* Main Chat Area */}
      <div className="flex h-full min-w-0 flex-1 flex-col">
        <ChatHeader
          isOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <MessageList
          messages={messages}
          isLoading={isLoading}
          error={error}
          scrollRef={scrollRef}
        />

        <ChatInput
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          activeConversationId={activeConversationId}
          textareaRef={textareaRef}
          onSend={handleSend}
        />
      </div>
    </div>
  )
}
