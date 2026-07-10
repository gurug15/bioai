import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

export function ChatInput({
  input,
  setInput,
  isLoading,
  activeConversationId,
  textareaRef,
  onSend,
}: {
  input: string
  setInput: (val: string) => void
  isLoading: boolean
  activeConversationId: string | null
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  onSend: (e?: React.FormEvent) => void
}) {
  return (
    <div className="mx-auto w-full max-w-3xl shrink-0 px-4 pt-2 pb-6">
      <form
        onSubmit={onSend}
        className="relative flex items-end overflow-hidden rounded-2xl border border-white/10 bg-[#2f2f2f] shadow-lg transition-colors focus-within:border-white/20"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            e.target.style.height = "auto"
            e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px"
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              onSend()
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
  )
}
