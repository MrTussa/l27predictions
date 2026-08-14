import { cn } from '@/utilities/cn'
import { cosmeticClass } from '@/utilities/cosmetics'

type Props = {
  /** Equipped nickname-effect id (from user.equippedNicknameEffect). */
  effect?: string | null
  children: React.ReactNode
  className?: string
}

// Renders a nickname with its purchased visual effect applied. Server-safe
// (no client hooks). Effect id → CSS class defined in globals.css.
export const Nickname: React.FC<Props> = ({ effect, children, className }) => {
  return <span className={cn(cosmeticClass(effect), className)}>{children}</span>
}
