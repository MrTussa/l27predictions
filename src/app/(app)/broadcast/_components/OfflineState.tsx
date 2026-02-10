import { Card } from '@/components/ui/card'

export function OfflineState() {
  return (
    <Card variant="default" corners="cut-corner">
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground font-bold uppercase tracking-wider text-lg">
            Трансляция не запущена
          </p>
          <p className="text-muted-foreground text-sm">
            Следите за расписанием гонок в разделе событий
          </p>
        </div>
      </div>
    </Card>
  )
}
