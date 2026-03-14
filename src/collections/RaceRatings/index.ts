import { adminOnly } from '@/access/adminOnly'
import { adminOrOwner } from '@/access/adminOrOwner'
import type { CollectionConfig } from 'payload'
import { updateRaceRatingCounts } from './hooks/updateRaceRatingCounts'

export const RaceRatings: CollectionConfig = {
  slug: 'race-ratings',
  access: {
    create: ({ req: { user } }) => !!user,
    delete: adminOnly,
    read: adminOrOwner(),
    update: adminOrOwner(),
  },
  admin: {
    group: 'F1 Championship',
    defaultColumns: ['user', 'race', 'rating'],
    useAsTitle: 'id',
    hidden: true,
  },
  indexes: [
    {
      fields: ['user', 'race'],
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
      admin: { readOnly: true },
    },
    {
      name: 'race',
      type: 'relationship',
      relationTo: 'races',
      required: true,
      label: 'Гонка',
    },
    {
      name: 'rating',
      type: 'select',
      required: true,
      label: 'Оценка',
      options: [
        { label: 'Плохо', value: 'bad' },
        { label: 'Нормально', value: 'normal' },
        { label: 'Хорошо', value: 'good' },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && req.user && data) {
          data.user = req.user.id
        }
        return data
      },
    ],
    afterChange: [updateRaceRatingCounts],
  },
}
