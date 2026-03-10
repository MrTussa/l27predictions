import { adminOnly } from '@/access/adminOnly'
import { adminOrSelf } from '@/access/adminOrSelf'
import type { CollectionConfig } from 'payload'

/**
 * Коллекция ответов пользователей на события
 * Хранит ответы на вопросы и рассчитывает награды
 */
export const EventResponses: CollectionConfig = {
  slug: 'event-responses',
  access: {
    create: ({ req: { user } }) => !!user,
    delete: adminOnly,
    read: adminOrSelf,
    update: adminOnly,
  },
  admin: {
    group: 'Events',
    defaultColumns: ['user', 'event', 'correctAnswersCount', 'reward', 'submittedAt'],
    useAsTitle: 'id',
    description: 'Ответы пользователей на события',
  },
  indexes: [
    {
      fields: ['user', 'event'],
    },
  ],
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
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
      label: 'Событие',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'answers',
      type: 'array',
      required: true,
      label: 'Ответы',
      admin: {
        readOnly: true,
        description: 'Ответы пользователя на каждый вопрос',
      },
      fields: [
        {
          name: 'questionIndex',
          type: 'number',
          required: true,
          label: 'Индекс вопроса',
          admin: {
            description: 'Порядковый номер вопроса в массиве questions события',
          },
        },
        {
          name: 'selectedOptions',
          type: 'array',
          label: 'Выбранные варианты (для single/multiple choice)',
          fields: [
            {
              name: 'optionIndex',
              type: 'number',
              required: true,
              label: 'Индекс варианта',
            },
          ],
        },
        {
          name: 'selectedAnswer',
          type: 'text',
          label: 'Выбранный ответ (для yes-no)',
          admin: {
            description: 'Значение: "yes" или "no"',
          },
        },
        {
          name: 'selectedDriver',
          type: 'relationship',
          relationTo: 'drivers',
          label: 'Выбранный пилот (для driver-select)',
          admin: {
            description: 'ID выбранного пилота',
          },
        },
        {
          name: 'selectedTeam',
          type: 'relationship',
          relationTo: 'teams',
          label: 'Выбранная команда (для team-select)',
          admin: {
            description: 'ID выбранной команды',
          },
        },
      ],
    },
    {
      name: 'correctAnswersCount',
      type: 'number',
      defaultValue: 0,
      label: 'Количество правильных ответов',
      admin: {
        readOnly: true,
        description: 'Рассчитывается автоматически после завершения события',
      },
    },
    {
      name: 'reward',
      type: 'number',
      defaultValue: 0,
      label: 'Начисленная награда',
      admin: {
        readOnly: true,
        description: 'Очки или Pit Coins (в зависимости от типа награды события)',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && req.user && data) {
          data.user = req.user.id
        }

        if (data?.user && data?.event && operation === 'create') {
          const userId = typeof data.user === 'object' ? data.user.id : data.user
          const eventId = typeof data.event === 'object' ? data.event.id : data.event

          const existing = await req.payload.find({
            collection: 'event-responses',
            where: {
              and: [{ user: { equals: userId } }, { event: { equals: eventId } }],
            },
            limit: 1,
          })

          if (existing.docs.length > 0) {
            throw new Error('Вы уже отправили ответ на это событие')
          }
        }

        return data
      },
    ],
  },
}
