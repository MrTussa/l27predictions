import { Card } from '@/components/ui/card'

export function PlaceholderCard({ text }: { text: string }) {
  return (
    <Card variant="gray" corners="cut-corner" className="h-full p-1">
      <div className="flex h-full min-h-77 md:min-h-65 items-center justify-center px-4 py-8 text-center text-sm text-muted-foreground">
        {text}
      </div>
    </Card>
  )
}
