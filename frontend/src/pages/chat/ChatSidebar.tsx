import { Plus, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserProfileButton } from "@/components/UserProfileButton"
import type { Conversation } from "@/lib/types"

export function ChatSidebar({
  isOpen,
  conversations,
  activeConversationId,
  onNewChat,
  onSwitchConversation,
}: {
  isOpen: boolean
  conversations: Conversation[]
  activeConversationId: string | null
  onNewChat: () => void
  onSwitchConversation: (id: string) => void
}) {
  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-0"
      } flex shrink-0 flex-col overflow-hidden border-r border-zinc-800 bg-[#171717] transition-all duration-300 ease-in-out`}
    >
      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-zinc-200 hover:bg-zinc-800"
          onClick={onNewChat}
        >
          <Plus size={16} />
          New chat
        </Button>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="flex flex-col gap-1 py-2">
          <p className="mb-2 px-2 text-xs font-semibold text-zinc-500">Today</p>
          {conversations.map((conv) => (
            <Button
              key={conv.id}
              variant="ghost"
              className={`w-full justify-start gap-3 truncate ${
                conv.id === activeConversationId
                  ? "bg-zinc-800 text-zinc-200"
                  : "text-zinc-400 hover:bg-zinc-800"
              }`}
              onClick={() => onSwitchConversation(conv.id)}
            >
              <MessageSquare size={16} />
              <span className="truncate">{conv.title}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
      <div className="mt-auto border-t border-zinc-800 p-3">
        <UserProfileButton />
      </div>
    </div>
  )
}
