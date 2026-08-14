import { Card } from '@/components/ui/card'
import { cn } from '@/utilities/cn'

export function PlaceholderCard({ text, className }: { text: string; className?: string }) {
  return (
    <Card variant="gray" corners="cut-corner" className="h-full p-1">
      <div
        className={cn(
          'flex h-full min-h-77 md:min-h-65 items-center justify-center px-4 py-8 text-center text-sm text-muted-foreground',
          className,
        )}
      >
        {text}
      </div>
    </Card>
  )
}
