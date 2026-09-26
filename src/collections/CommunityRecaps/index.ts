import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access'

// Тексты страницы «Итоги сезона» от нейросети: одна запись на сезон
export const CommunityRecaps: CollectionConfig = {
  slug: 'community-recaps',
  typescript: { interface: 'CommunityRecapRecord' },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOnly,
    update: adminOnly,
  },
  admin: {
    group: 'F1 Championship',
    defaultColumns: ['season', 'model', 'updatedAt'],
    useAsTitle: 'season',
    description:
      'Тексты общей страницы итогов сезона от нейросети. Можно поправить вручную; удалите запись, чтобы сгенерировать заново.',
  },
  fields: [
    {
      name: 'season',
      type: 'number',
      required: true,
      unique: true,
      label: 'Сезон',
    },
    {
      name: 'fingerprint',
      type: 'text',
      required: true,
      label: 'Отпечаток статистики',
      admin: {
        readOnly: true,
        description: 'Когда статистика сезона меняется, тексты генерируются заново',
      },
    },
    {
      name: 'model',
      type: 'text',
      label: 'Модель',
      admin: { readOnly: true },
    },
    {
      name: 'texts',
      type: 'json',
      required: true,
      label: 'Тексты',
    },
  ],
}
