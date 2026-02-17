import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { publicAccess } from '@/access/publicAccess'
import { updateSeasonStatsOnResults } from './hooks/updateSeasonStatsOnResults'

export const Races: CollectionConfig = {
  slug: 'races',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: publicAccess,
    update: adminOnly,
  },
  admin: {
    group: 'F1 Championship',
    defaultColumns: ['name', 'round', 'season', 'raceDate'],
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Название гонки',
      admin: {
        description: 'Например: Monaco Grand Prix',
      },
    },
    {
      name: 'season',
      type: 'number',
      required: true,
      defaultValue: () => new Date().getFullYear(),
      label: 'Сезон',
      admin: {
        description: 'Год сезона (например, 2026)',
      },
    },
    {
      name: 'round',
      type: 'number',
      required: true,
      min: 1,
      max: 30,
      label: 'Номер этапа в сезоне',
    },
    {
      name: 'countryFlag',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Флаг страны',
      admin: {
        description: 'Рекомендуемый размер: 500x500px',
      },
    },
    {
      name: 'trackSVGPath',
      type: 'textarea',
      required: false,
      label: 'SVG Path трассы',
      admin: {
        description:
          'Строгое форматирование к размерам, обязательно  viewBox="144 144 512 512" width="800px" height="800px"',
        placeholder:
          '<svg xmlns="http://www.w3.org/2000/svg" fill="#000000" width="800px" height="800px" version="1.1" viewBox="144 144 512 512">',
      },
    },
    {
      name: 'predictionOpenDate',
      type: 'date',
      required: true,
      label: 'Дата открытия прогнозов',
      admin: {
        date: {
          displayFormat: 'd MMM yyyy HH:mm',
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'predictionCloseDate',
      type: 'date',
      required: true,
      label: 'Дата закрытия прогнозов',
      admin: {
        date: {
          displayFormat: 'd MMM yyyy HH:mm',
          pickerAppearance: 'dayAndTime',
        },
        description: 'Обычно за несколько часов до начала гонки',
      },
    },
    {
      name: 'raceDate',
      type: 'date',
      required: true,
      label: 'Дата и время гонки',
      admin: {
        date: {
          displayFormat: 'd MMM yyyy HH:mm',
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'results',
      type: 'array',
      label: 'Результаты гонки (топ-3)',
      maxRows: 3,
      minRows: 0,
      admin: {
        description: 'Заполняется после завершения гонки для расчета баллов',
        initCollapsed: false,
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'position',
              type: 'number',
              required: true,
              min: 1,
              max: 3,
              label: 'Позиция',
              admin: {
                width: '20%',
              },
            },
            {
              name: 'driver',
              type: 'relationship',
              relationTo: 'drivers',
              required: true,
              label: 'Пилот',
              admin: {
                width: '80%',
              },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [updateSeasonStatsOnResults],
    beforeValidate: [
      ({ data }) => {
        // Валидация: дата закрытия прогнозов должна быть раньше даты гонки
        if (data?.predictionCloseDate && data?.raceDate) {
          const closeDate = new Date(data.predictionCloseDate)
          const raceDate = new Date(data.raceDate)

          if (closeDate >= raceDate) {
            throw new Error('Дата закрытия прогнозов должна быть раньше даты гонки')
          }
        }

        // Валидация: дата открытия должна быть раньше даты закрытия
        if (data?.predictionOpenDate && data?.predictionCloseDate) {
          const openDate = new Date(data.predictionOpenDate)
          const closeDate = new Date(data.predictionCloseDate)

          if (openDate >= closeDate) {
            throw new Error('Дата открытия прогнозов должна быть раньше даты закрытия')
          }
        }

        // Валидация результатов: проверяем уникальность позиций
        if (data?.results && data.results.length > 0) {
          const positions = data.results.map((r: { position: number }) => r.position)
          const uniquePositions = new Set(positions)

          if (positions.length !== uniquePositions.size) {
            throw new Error('Каждая позиция должна быть уникальной (1, 2, 3)')
          }

          // Проверяем, что позиции идут от 1 до количества результатов
          const sortedPositions = [...positions].sort((a, b) => a - b)
          for (let i = 0; i < sortedPositions.length; i++) {
            if (sortedPositions[i] !== i + 1) {
              throw new Error('Позиции должны быть последовательными (1, 2, 3)')
            }
          }
        }

        return data
      },
    ],
  },
}
