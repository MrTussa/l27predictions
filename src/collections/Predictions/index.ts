import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { adminOrSelf } from '@/access/adminOrSelf'
import { normalizeID, normalizeIDs } from '@/utilities/normalizeID'
import { canMakePrediction } from '@/utilities/raceStatus'

export const Predictions: CollectionConfig = {
  slug: 'predictions',
  access: {
    create: ({ req: { user } }) => {
      return !!user
    },
    delete: adminOnly,
    read: adminOrSelf,
    update: adminOrSelf,
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
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && req.user && data) {
          data.user = req.user.id
        }

        if (data?.predictions && data.predictions.length > 0) {
          const positions = data.predictions.map((p: { position: number }) => p.position)
          const uniquePositions = new Set(positions)

          if (positions.length !== uniquePositions.size) {
            throw new Error('Каждая позиция должна быть уникальной (1, 2, 3)')
          }

          const sortedPositions = [...positions].sort((a, b) => a - b)
          if (
            sortedPositions.length !== 3 ||
            sortedPositions[0] !== 1 ||
            sortedPositions[2] !== 3
          ) {
            throw new Error('Необходимо заполнить все 3 позиции (1, 2, 3)')
          }

          const drivers = normalizeIDs(
            data.predictions.map((p: { driver: string | object }) => p.driver),
          )
          const uniqueDrivers = new Set(drivers)

          if (drivers.length !== uniqueDrivers.size) {
            throw new Error('Каждый пилот может быть выбран только один раз')
          }
        }

        if (req.user && !req.user.roles?.includes('admin')) {
          if (data?.race) {
            const race = await req.payload.findByID({
              collection: 'races',
              id: normalizeID(data.race),
            })

            if (race && !canMakePrediction(race)) {
              throw new Error('Время для прогнозов на эту гонку истекло')
            }
          }
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
