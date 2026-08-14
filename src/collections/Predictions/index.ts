import type { CollectionConfig } from 'payload'

import { adminOnly, adminOrOwner, isAdmin } from '@/access'
import { normalizeID, normalizeIDs } from '@/utilities/normalizeID'
import { canMakePrediction } from '@/utilities/raceStatus'

export const Predictions: CollectionConfig = {
  slug: 'predictions',
  access: {
    create: ({ req: { user } }) => !!user,
    delete: adminOnly,
    read: adminOrOwner,
    update: adminOrOwner,
  },
  admin: {
    group: 'F1 Championship',
    defaultColumns: ['user', 'race', 'points'],
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
      async ({ data, req, operation, originalDoc }) => {
        if (operation === 'create' && req.user && data) {
          data.user = req.user.id
        }

        if (data?.predictions?.length) {
          const positions = data.predictions
            .map((p: { position: number }) => p.position)
            .sort((a: number, b: number) => a - b)

          if (positions.join() !== '1,2,3') {
            throw new Error('Необходимо заполнить все 3 позиции (1, 2, 3)')
          }

          const drivers = normalizeIDs(
            data.predictions.map((p: { driver: string | object }) => p.driver),
          )

          if (new Set(drivers).size !== drivers.length) {
            throw new Error('Каждый пилот может быть выбран только один раз')
          }
        }

        // Окно прогнозов. Админ правит в любой момент.
        const raceId = normalizeID(data?.race ?? originalDoc?.race)
        if (raceId && !isAdmin(req.user)) {
          const race = await req.payload.findByID({ collection: 'races', id: raceId })
          if (!canMakePrediction(race)) {
            throw new Error('Окно прогнозов для этой гонки закрыто')
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
