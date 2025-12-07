import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'

export const SeasonStats: CollectionConfig = {
  slug: 'season-stats',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: () => true,
    update: adminOnly,
  },
  admin: {
    group: 'F1 Championship',
    defaultColumns: ['user', 'season', 'totalPoints', 'predictionsCount', 'currentStreak'],
    useAsTitle: 'id',
    description: 'Кешированная статистика пользователей по сезонам',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Пользователь',
      index: true,
    },
    {
      name: 'season',
      type: 'number',
      required: true,
      label: 'Сезон',
      admin: {
        description: 'Год сезона (например, 2025)',
      },
      index: true,
    },
    {
      name: 'totalPoints',
      type: 'number',
      defaultValue: 0,
      required: true,
      label: 'Всего очков',
      admin: {
        description: 'Сумма всех очков за сезон',
      },
    },
    {
      name: 'predictionsCount',
      type: 'number',
      defaultValue: 0,
      required: true,
      label: 'Количество прогнозов',
    },
    {
      name: 'perfectPredictions',
      type: 'number',
      defaultValue: 0,
      required: true,
      label: 'Идеальные прогнозы',
      admin: {
        description: 'Количество прогнозов где все 3 позиции угаданы точно',
      },
    },
    {
      name: 'currentStreak',
      type: 'number',
      defaultValue: 0,
      required: true,
      label: 'Текущий стрик',
      admin: {
        description: 'Количество гонок подряд с прогнозами',
      },
    },
    {
      name: 'bestStreak',
      type: 'number',
      defaultValue: 0,
      required: true,
      label: 'Лучший стрик',
      admin: {
        description: 'Максимальный стрик за сезон',
      },
    },
    {
      name: 'raceHistory',
      type: 'array',
      label: 'История по гонкам',
      admin: {
        description: 'Данные для графиков эволюции очков',
      },
      fields: [
        {
          name: 'race',
          type: 'relationship',
          relationTo: 'races',
          required: true,
          label: 'Гонка',
        },
        {
          name: 'points',
          type: 'number',
          defaultValue: 0,
          required: true,
          label: 'Очки за гонку',
        },
        {
          name: 'cumulativePoints',
          type: 'number',
          defaultValue: 0,
          required: true,
          label: 'Накопленные очки',
          admin: {
            description: 'Сумма очков с начала сезона до этой гонки включительно',
          },
        },
        {
          name: 'rank',
          type: 'number',
          label: 'Позиция',
          admin: {
            description: 'Место пользователя в этой гонке (опционально)',
          },
        },
      ],
    },
    {
      name: 'lastCalculated',
      type: 'date',
      admin: {
        date: {
          displayFormat: 'd MMM yyyy HH:mm',
        },
      },
      label: 'Последний пересчет',
    },
  ],
  indexes: [
    {
      fields: ['user', 'season'],
      unique: true,
    },
    {
      fields: ['season', 'totalPoints'],
    },
  ],
}
