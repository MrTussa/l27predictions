import { adminOnly } from '@/access/adminOnly'
import { publicAccess } from '@/access/publicAccess'
import type { CollectionConfig } from 'payload'

/**
 * Коллекция универсальных событий
 * Поддерживает голосования, квизы, предсказания с гибкой системой вопросов
 */
export const F1Events: CollectionConfig = {
  slug: 'events',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: publicAccess,
    update: adminOnly,
  },
  admin: {
    group: 'Events',
    defaultColumns: ['name', 'status', 'rewardType', 'season'],
    useAsTitle: 'name',
    description: 'Универсальные события: голосования, квизы, предсказания',
  },
  fields: [
    {
      name: 'eventType',
      type: 'select',
      required: true,
      defaultValue: 'general',
      label: 'Тип события',
      options: [
        { label: 'Обычное событие', value: 'general' },
        { label: 'Сезонный прогноз', value: 'season-prediction' },
      ],
      admin: {
        description:
          'general: обычные голосования и квизы | season-prediction: прогноз итогов сезона',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Название события',
      admin: {
        description: 'Краткое название (например: "Голосование за MVP сезона")',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Описание',
      admin: {
        description: 'Подробное описание события для пользователей',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      label: 'Статус события',
      options: [
        { label: 'Черновик', value: 'draft' },
        { label: 'Открыто', value: 'open' },
        { label: 'Закрыто', value: 'closed' },
        { label: 'Завершено', value: 'completed' },
      ],
      admin: {
        description:
          'draft: не виден пользователям | open: принимаются ответы | closed: ответы закрыты | completed: результаты подведены',
      },
    },
    {
      name: 'rewardType',
      type: 'select',
      required: true,
      defaultValue: 'points',
      label: 'Тип награды',
      options: [
        { label: 'Очки (для рейтинга)', value: 'points' },
        { label: 'Pit Coins (валюта)', value: 'pit-coins' },
      ],
      admin: {
        description: 'Тип награды для всех вопросов в этом событии',
      },
    },
    {
      name: 'questions',
      type: 'array',
      required: true,
      minRows: 1,
      label: 'Вопросы',
      admin: {
        description: 'Добавьте один или несколько вопросов',
      },
      fields: [
        {
          name: 'questionText',
          type: 'text',
          required: true,
          label: 'Текст вопроса',
        },
        {
          name: 'questionType',
          type: 'select',
          required: true,
          defaultValue: 'single-choice',
          label: 'Тип вопроса',
          options: [
            { label: 'Один вариант (select)', value: 'single-choice' },
            { label: 'Несколько вариантов (checkbox)', value: 'multiple-choice' },
            { label: 'Да/Нет', value: 'yes-no' },
            { label: 'Выбор пилота', value: 'driver-select' },
            { label: 'Выбор команды', value: 'team-select' },
          ],
        },
        {
          name: 'rewardPoints',
          type: 'number',
          required: true,
          defaultValue: 10,
          label: 'Награда за правильный ответ',
          admin: {
            description: 'Количество очков/монет за правильный ответ на этот вопрос',
          },
        },
        {
          name: 'options',
          type: 'array',
          label: 'Варианты ответов',
          admin: {
            description: 'Добавьте варианты для single-choice и multiple-choice',
            condition: (data, siblingData) => {
              return (
                siblingData?.questionType === 'single-choice' ||
                siblingData?.questionType === 'multiple-choice'
              )
            },
          },
          fields: [
            {
              name: 'optionText',
              type: 'text',
              required: true,
              label: 'Текст варианта',
            },
            {
              name: 'isCorrect',
              type: 'checkbox',
              defaultValue: false,
              label: 'Правильный ответ',
              admin: {
                description: 'Отметьте правильные варианты (устанавливается после закрытия)',
              },
            },
          ],
        },
        {
          name: 'correctAnswer',
          type: 'select',
          label: 'Правильный ответ (Да/Нет)',
          options: [
            { label: 'Да', value: 'yes' },
            { label: 'Нет', value: 'no' },
          ],
          admin: {
            description: 'Правильный ответ для вопроса типа Да/Нет',
            condition: (data, siblingData) => {
              return siblingData?.questionType === 'yes-no'
            },
          },
        },
        {
          name: 'correctDriver',
          type: 'relationship',
          relationTo: 'drivers',
          label: 'Правильный пилот',
          admin: {
            description: 'Выберите правильного пилота после завершения события',
            condition: (data, siblingData) => {
              return siblingData?.questionType === 'driver-select'
            },
          },
        },
        {
          name: 'correctTeam',
          type: 'relationship',
          relationTo: 'teams',
          label: 'Правильная команда',
          admin: {
            description: 'Выберите правильную команду после завершения события',
            condition: (data, siblingData) => {
              return siblingData?.questionType === 'team-select'
            },
          },
        },
      ],
    },
    {
      name: 'season',
      type: 'number',
      label: 'Сезон (год)',
      admin: {
        description: 'Опционально: привязка к сезону Ф1',
      },
    },
    {
      name: 'openedAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: {
          displayFormat: 'dd.MM.yyyy HH:mm',
        },
      },
      label: 'Дата открытия',
    },
    {
      name: 'closedAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: {
          displayFormat: 'dd.MM.yyyy HH:mm',
        },
      },
      label: 'Дата закрытия',
    },
    {
      name: 'completedAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: {
          displayFormat: 'dd.MM.yyyy HH:mm',
        },
      },
      label: 'Дата завершения',
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc }) => {
        if (operation === 'update' && data) {
          const now = new Date().toISOString()

          // Открытие события
          if (data.status === 'open' && originalDoc?.status !== 'open' && !data.openedAt) {
            data.openedAt = now
          }

          // Закрытие события
          if (data.status === 'closed' && originalDoc?.status !== 'closed' && !data.closedAt) {
            data.closedAt = now
          }

          // Завершение события
          if (
            data.status === 'completed' &&
            originalDoc?.status !== 'completed' &&
            !data.completedAt
          ) {
            data.completedAt = now
          }
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, req, operation, previousDoc }) => {
        if (
          operation === 'update' &&
          doc.status === 'completed' &&
          previousDoc?.status !== 'completed' &&
          req.payload
        ) {
          console.log(`\nEvent "${doc.name}" completed, calculating rewards...`)

          try {
            const { calculateEventRewards } = await import('@/utilities/calculateEventRewards')
            await calculateEventRewards(req.payload, doc.id)
            console.log(` Event rewards calculated successfully`)
          } catch (error) {
            console.error(` Error calculating event rewards:`, error)
          }
        }
      },
    ],
  },
}
