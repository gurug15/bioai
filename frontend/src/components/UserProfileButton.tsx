import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return parts[0][0].toUpperCase()
  }
  if (email) {
    return email[0].toUpperCase()
  }
  return "?"
}

function getDisplayName(name?: string | null, email?: string | null): string {
  if (name && name.trim()) return name.trim()
  if (email) return email
  return "User"
}

export function UserProfileButton() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)

  if (!user) return null

  const initials = getInitials(user.name, user.email)
  const displayName = getDisplayName(user.name, user.email)

  async function handleLogout() {
    setIsLoggingOut(true)
    setLogoutError(null)
    try {
      await logout()
      setOpen(false)
      navigate("/login")
    } catch {
      setLogoutError("Failed to log out. Please try again.")
      setIsLoggingOut(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
          aria-label="Open user menu"
        >
          <Avatar className="h-8 w-8 shrink-0 bg-zinc-700">
            <AvatarFallback className="bg-zinc-700 text-xs font-semibold text-zinc-200 uppercase">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="truncate text-sm text-zinc-200">{displayName}</span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="start"
        sideOffset={8}
        className="min-w-[240px] rounded-xl border border-zinc-700 bg-[#2a2a2a] p-3 shadow-xl"
      >
        {/* User info section */}
        <div className="flex items-center gap-3 pb-3">
          <Avatar className="h-10 w-10 shrink-0 bg-zinc-700">
            <AvatarFallback className="bg-zinc-700 text-sm font-semibold text-zinc-200 uppercase">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-zinc-100">
              {displayName}
            </p>
            {user.email && (
              <p className="truncate text-xs text-zinc-400">{user.email}</p>
            )}
          </div>
        </div>

        <Separator className="my-1 bg-zinc-700" />

        {/* Error message */}
        {logoutError && (
          <p className="mt-2 text-xs text-red-400">{logoutError}</p>
        )}

        {/* Logout button */}
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full justify-start gap-2 text-sm text-red-400 hover:bg-red-400/10 hover:text-red-300"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut size={15} />
          {isLoggingOut ? "Logging out…" : "Log out"}
        </Button>
      </PopoverContent>
    </Popover>
  )
}
