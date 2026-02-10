import type { GlobalConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'

export const BroadcastSettings: GlobalConfig = {
  slug: 'broadcast-settings',
  label: 'Настройки трансляции',
  access: {
    read: () => true,
    update: adminOnly,
  },
  fields: [
    {
      name: 'isLive',
      type: 'checkbox',
      label: 'Трансляция активна',
      defaultValue: false,
    },
    {
      name: 'twitchChannel',
      type: 'text',
      label: 'Twitch канал',
      admin: {
        description: 'Имя Twitch канала, например: limonov_f1',
      },
    },
    {
      name: 'vkChannel',
      type: 'text',
      label: 'VK канал',
      admin: {
        description: 'Имя VK канала, например: f1_live',
      },
    },
  ],
}
