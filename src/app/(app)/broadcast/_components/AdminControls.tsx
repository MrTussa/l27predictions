'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { BroadcastSetting } from '@/payload-types'

interface AdminControlsProps {
  settings: BroadcastSetting
}

export function AdminControls({ settings }: AdminControlsProps) {
  const [twitchChannel, setTwitchChannel] = useState(settings.twitchChannel || '')
  const [vkChannel, setVkChannel] = useState(settings.vkChannel || '')
  const [isLive, setIsLive] = useState(settings.isLive || false)
  const [isSaving, setIsSaving] = useState(false)

  const updateSettings = useCallback(async (data: Partial<BroadcastSetting>) => {
    setIsSaving(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/globals/broadcast-settings`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        },
      )

      if (!res.ok) throw new Error('Ошибка сохранения')

      toast.success('Настройки сохранены')
    } catch {
      toast.error('Не удалось сохранить настройки')
    } finally {
      setIsSaving(false)
    }
  }, [])

  const handleSave = useCallback(() => {
    updateSettings({ twitchChannel, vkChannel })
  }, [twitchChannel, vkChannel, updateSettings])

  const handleToggleLive = useCallback(() => {
    const newIsLive = !isLive
    setIsLive(newIsLive)
    updateSettings({ twitchChannel, vkChannel, isLive: newIsLive })
  }, [isLive, twitchChannel, vkChannel, updateSettings])

  return (
    <Card variant="yellow" corners="cut-corner" className="mb-6">
      <div className="px-6 space-y-4">
        <h2 className="text-sm font-bold uppercase text-primary">Управление трансляцией</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="twitch-channel" className="text-muted-foreground text-xs uppercase">
              Twitch канал
            </Label>
            <Input
              id="twitch-channel"
              value={twitchChannel}
              onChange={(e) => setTwitchChannel(e.target.value)}
              placeholder="limonov_27"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vk-channel" className="text-muted-foreground text-xs uppercase">
              VK канал
            </Label>
            <Input
              id="vk-channel"
              value={vkChannel}
              onChange={(e) => setVkChannel(e.target.value)}
              placeholder="f1_live"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleSave} isLoading={isSaving} size="sm">
            Сохранить
          </Button>
          <Button
            onClick={handleToggleLive}
            variant={isLive ? 'destructive' : 'success'}
            size="sm"
            isLoading={isSaving}
          >
            {isLive ? 'Остановить трансляцию' : 'Начать трансляцию'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
