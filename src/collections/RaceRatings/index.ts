import { adminOnly } from '@/access/adminOnly'
import { adminOrSelf } from '@/access/adminOrSelf'
import type { CollectionConfig } from 'payload'
import { updateRaceRatingCounts } from './hooks/updateRaceRatingCounts'

export const RaceRatings: CollectionConfig = {
  slug: 'race-ratings',
  access: {
    create: ({ req: { user } }) => !!user,
    delete: adminOnly,
    read: adminOrSelf,
    update: adminOrSelf,
  },
  admin: {
    group: 'F1 Championship',
    defaultColumns: ['user', 'race', 'rating', 'submittedAt'],
    useAsTitle: 'id',
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
      admin: { readOnly: true },
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
    afterChange: [updateRaceRatingCounts],
  },
}
