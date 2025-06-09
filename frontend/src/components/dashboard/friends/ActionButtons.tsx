import { Button } from "@/components/ui/button"
import { 
  UserPlus, 
  UserX, 
  UserMinus, 
  Shield, 
  Loader2,
  MessageSquare
} from "lucide-react"
import Link from 'next/link'

interface ActionButtonProps {
  onClick?: () => void
  isLoading?: boolean
  disabled?: boolean
  compact?: boolean
}

export function AcceptButton({ onClick, isLoading, disabled, compact = false }: ActionButtonProps) {
  return (
    <Button 
      variant={compact ? "outline" : "default"}
      size={compact ? "sm" : "default"}
      className={`${compact ? 'h-9' : ''} gap-1 bg-primary-1 text-primary-1-foreground hover:bg-card hover:text-card-foreground`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? <Loader2 className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} animate-spin`} /> : <UserPlus className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />}
      <span className="hidden sm:inline">Accept</span>
      <span className="sm:hidden">✓</span>
    </Button>
  )
}

export function RejectButton({ onClick, isLoading, disabled, compact = false }: ActionButtonProps) {
  return (
    <Button 
      variant={compact ? "outline" : "default"}
      size={compact ? "sm" : "default"}
      className={`${compact ? 'h-9' : ''} gap-1 bg-warning-1 text-warning-1-foreground hover:bg-card hover:text-card-foreground`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? <Loader2 className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} animate-spin`} /> : <UserX className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />}
      <span className="hidden sm:inline">Reject</span>
      <span className="sm:hidden">✕</span>
    </Button>
  )
}

export function CancelButton({ onClick, isLoading, disabled, compact = false }: ActionButtonProps) {
  return (
    <Button 
      variant={compact ? "outline" : "default"}
      size={compact ? "sm" : "default"}
      className={`${compact ? 'h-9' : ''} gap-1 bg-warning-1 text-warning-1-foreground hover:bg-card hover:text-card-foreground`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? <Loader2 className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} animate-spin`} /> : <UserX className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />}
      <span className="hidden sm:inline">Cancel</span>
      <span className="sm:hidden">✕</span>
    </Button>
  )
}

export function RemoveButton({ onClick, isLoading, disabled, compact = false }: ActionButtonProps) {
  return (
    <Button 
      variant={compact ? "outline" : "default"}
      size={compact ? "sm" : "default"}
      className={`${compact ? 'h-9' : ''} gap-1 bg-warning-1 text-warning-1-foreground hover:bg-card hover:text-card-foreground`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? <Loader2 className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} animate-spin`} /> : <UserMinus className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />}
      <span className="hidden sm:inline">Remove</span>
      <span className="sm:hidden">✕</span>
    </Button>
  )
}

export function BlockButton({ onClick, isLoading, disabled, compact = false }: ActionButtonProps) {
  return (
    <Button 
      variant={compact ? "outline" : "default"}
      size={compact ? "sm" : "default"}
      className={`${compact ? 'h-9' : ''} gap-1 bg-error-1 text-error-1-foreground hover:bg-card hover:text-card-foreground`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? <Loader2 className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} animate-spin`} /> : <Shield className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />}
      <span className="hidden sm:inline">Block</span>
      <span className="sm:hidden">⛔</span>
    </Button>
  )
}

export function UnblockButton({ onClick, isLoading, disabled, compact = false }: ActionButtonProps) {
  return (
    <Button 
      variant="outline"
      size={compact ? "sm" : "default"}
      className={`${compact ? 'h-9' : ''} gap-1`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? <Loader2 className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} animate-spin`} /> : <Shield className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />}
      <span className="hidden sm:inline">Unblock</span>
      <span className="sm:hidden">✓</span>
    </Button>
  )
}

export function AddButton({ onClick, isLoading, disabled, compact = false }: ActionButtonProps) {
  return (
    <Button 
      variant={compact ? "outline" : "default"}
      size={compact ? "sm" : "default"}
      className={`${compact ? 'h-9' : ''} gap-1 bg-primary-1 text-primary-1-foreground hover:bg-card hover:text-card-foreground`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? <Loader2 className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} animate-spin`} /> : <UserPlus className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />}
      <span className="hidden sm:inline">Add</span>
      <span className="sm:hidden">+</span>
    </Button>
  )
}

interface MessageButtonProps extends ActionButtonProps {
  userId: number
}

export function MessageButton({ userId, compact = false }: MessageButtonProps) {
  return (
    <Button 
      variant="secondary"
      size={compact ? "sm" : "default"}
      className={`${compact ? 'h-9' : ''} gap-1 bg-primary-1 text-primary-1-foreground hover:bg-card hover:text-card-foreground`}
      asChild
    >
      <Link href={`/dashboard/chat?user=${userId}`}>
        <MessageSquare className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
        <span className="hidden sm:inline">Message</span>
        <span className="sm:hidden">💬</span>
      </Link>
    </Button>
  )
} 