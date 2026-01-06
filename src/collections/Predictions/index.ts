import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { canMakePrediction } from '@/utilities/raceStatus'

export const Predictions: CollectionConfig = {
  slug: 'predictions',
  access: {
    create: ({ req: { user } }) => {
      // Только авторизованные пользователи могут создавать прогнозы
      return !!user
    },
    delete: adminOnly,
    read: ({ req: { user } }) => {
      if (!user) return false

      // Админ видит всё
      if (user.roles?.includes('admin')) {
        return true
      }

      // Обычный пользователь видит только свои прогнозы
      return {
        user: {
          equals: user.id,
        },
      }
    },
    update: ({ req: { user } }) => {
      if (!user) return false

      // Админ может обновлять всё
      if (user.roles?.includes('admin')) {
        return true
      }

      // Обычный пользователь может обновлять только свои прогнозы
      // Дополнительная проверка времени будет в beforeValidate хуке
      return {
        user: {
          equals: user.id,
        },
      }
    },
  },
  admin: {
    group: 'F1 Championship',
    defaultColumns: ['user', 'race', 'points', 'submittedAt'],
    useAsTitle: 'id',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Пользователь',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'race',
      type: 'relationship',
      relationTo: 'races',
      required: true,
      label: 'Гонка',
    },
    {
      name: 'predictions',
      type: 'array',
      required: true,
      minRows: 3,
      maxRows: 3,
      label: 'Прогноз топ-3',
      fields: [
        {
          name: 'position',
          type: 'number',
          required: true,
          min: 1,
          max: 3,
          label: 'Позиция',
        },
        {
          name: 'driver',
          type: 'relationship',
          relationTo: 'drivers',
          required: true,
          label: 'Пилот',
        },
      ],
    },
    {
      name: 'points',
      type: 'number',
      defaultValue: 0,
      label: 'Набранные баллы',
      admin: {
        readOnly: true,
        description: 'Рассчитывается автоматически после ввода результатов гонки',
      },
    },
    {
      name: 'submittedAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: {
          displayFormat: 'd MMM yyyy HH:mm',
        },
      },
      label: 'Дата первой отправки',
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        // Устанавливаем user из req.user при создании
        if (operation === 'create' && req.user && data) {
          data.user = req.user.id
        }

        // Валидация: проверяем уникальность позиций в прогнозе
        if (data?.predictions && data.predictions.length > 0) {
          const positions = data.predictions.map((p: any) => p.position)
          const uniquePositions = new Set(positions)

          if (positions.length !== uniquePositions.size) {
            throw new Error('Каждая позиция должна быть уникальной (1, 2, 3)')
          }

          // Проверяем, что все позиции от 1 до 3
          const sortedPositions = [...positions].sort((a, b) => a - b)
          if (sortedPositions.length !== 3 || sortedPositions[0] !== 1 || sortedPositions[2] !== 3) {
            throw new Error('Необходимо заполнить все 3 позиции (1, 2, 3)')
          }

          // Проверяем уникальность пилотов
          const drivers = data.predictions.map((p: any) => p.driver)
          const uniqueDrivers = new Set(drivers.map((d: any) => (typeof d === 'object' ? d.id : d)))

          if (drivers.length !== uniqueDrivers.size) {
            throw new Error('Каждый пилот может быть выбран только один раз')
          }
        }

        // Проверяем, что окно прогнозов ещё открыто (только для не-админов)
        if (req.user && !req.user.roles?.includes('admin')) {
          if (data?.race) {
            const raceId = typeof data.race === 'object' ? data.race.id : data.race
            const race = await req.payload.findByID({
              collection: 'races',
              id: raceId,
            })

            // Используем унифицированную функцию проверки
            if (race && !canMakePrediction(race)) {
              throw new Error('Время для прогнозов на эту гонку истекло')
            }
          }
        }

        return data
      },
    ],
    beforeChange: [
      async ({ data, operation }) => {
        // Устанавливаем submittedAt при первом создании
        if (operation === 'create') {
          data.submittedAt = new Date().toISOString()
        }

        return data
      },
    ],
  },
  indexes: [
    {
      fields: ['user', 'race'],
      unique: true,
    },
  ],
}
