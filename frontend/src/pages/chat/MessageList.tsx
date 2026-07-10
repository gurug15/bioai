import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Message } from "@/lib/types"
import { Bot, Loader2, User } from "lucide-react"

export function MessageList({
  messages,
  isLoading,
  error,
  scrollRef,
}: {
  messages: Message[]
  isLoading: boolean
  error: string | null
  scrollRef: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <>
      {error && (
        <div className="mx-auto w-full max-w-3xl px-4 py-2">
          <div className="rounded-lg bg-red-900/40 px-4 py-2 text-sm text-red-300">
            {error}
          </div>
        </div>
      )}

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
    </>
  )
}
