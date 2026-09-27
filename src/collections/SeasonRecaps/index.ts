import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access'

// Тексты «Итогов сезона» от нейросети: пишет скрипт scripts/generate-recaps.ts, сайт только читает
export const SeasonRecaps: CollectionConfig = {
  slug: 'season-recaps',
  // SeasonRecap — это посчитанная сводка в utilities/seasonRecap
  typescript: { interface: 'SeasonRecapRecord' },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOnly,
    update: adminOnly,
  },
  admin: {
    group: 'F1 Championship',
    defaultColumns: ['user', 'season', 'model', 'updatedAt'],
    useAsTitle: 'id',
    description:
      'Тексты «Итогов сезона» от нейросети, их пишет скрипт npm run recap:generate. Тексты можно поправить вручную.',
  },
  indexes: [
    {
      fields: ['user', 'season'],
      unique: true,
    },
  ],
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Пользователь',
    },
    {
      name: 'season',
      type: 'number',
      required: true,
      label: 'Сезон',
    },
    {
      name: 'fingerprint',
      type: 'text',
      required: true,
      label: 'Отпечаток статистики',
      admin: {
        readOnly: true,
        description:
          'Статистика, по которой написаны тексты. Если она изменилась, скрипт перепишет тексты',
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
