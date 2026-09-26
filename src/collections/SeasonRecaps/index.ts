import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access'

// Тексты «Итогов сезона» от нейросети: генерируются один раз на игрока и сезон
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
      'Тексты «Итогов сезона» от нейросети. Их можно поправить вручную; удалите запись, чтобы сгенерировать заново.',
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
        description: 'Когда статистика игрока меняется, тексты генерируются заново',
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
