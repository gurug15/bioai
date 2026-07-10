import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export function ChatHeader({
  isOpen,
  onToggleSidebar,
}: {
  isOpen: boolean
  onToggleSidebar: () => void
}) {
  return (
    <div className="flex h-14 shrink-0 items-center px-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        className="mr-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
      >
        <Menu size={20} />
      </Button>
      <div className="text-lg font-semibold">BioAI Assistant</div>
    </div>
  )
}
