import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { publicAccess } from '@/access/publicAccess'
import { adminOrSelf } from '@/access/adminOrSelf'
import { checkRole } from '@/access/utilities'

import { ensureFirstUserIsAdmin } from './hooks/ensureFirstUserIsAdmin'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: ({ req: { user } }) => checkRole(['admin'], user),
    create: publicAccess,
    delete: adminOnly,
    read: adminOrSelf,
    update: adminOrSelf,
  },
  admin: {
    group: 'Users',
    defaultColumns: ['nickname', 'email', 'roles', 'chartColor'],
    useAsTitle: 'nickname',
  },
  auth: {
    tokenExpiration: 1209600,
  },
  fields: [
    {
      name: 'nickname',
      type: 'text',
      required: true,
      unique: true,
      label: 'Никнейм',
      admin: {
        description: 'Уникальное отображаемое имя (3-20 символов)',
      },
      minLength: 3,
      maxLength: 20,
      validate: (val: string | null | undefined) => {
        if (val && !/^[a-zA-Z0-9_а-яА-ЯёЁ]+$/i.test(val)) {
          return 'Никнейм может содержать только буквы, цифры и подчеркивание'
        }
        return true
      },
    },
    {
      name: 'telegramUsername',
      type: 'text',
      label: 'Telegram Username',
      admin: {
        description: 'Например: @username (опционально)',
      },
      validate: (val: string | null | undefined) => {
        if (val && typeof val === 'string' && val.length > 0 && !/^@?[a-zA-Z0-9_]{5,32}$/.test(val)) {
          return 'Неверный формат Telegram username'
        }
        return true
      },
    },
    {
      name: 'chartColor',
      type: 'text',
      required: true,
      defaultValue: '#FFDF2C',
      label: 'Цвет для графиков',
      admin: {
        description: 'HEX цвет для отображения в таблице лидеров и графиках',
      },
      validate: (val: string | null | undefined) => {
        if (val && !/^#[0-9A-F]{6}$/i.test(val)) {
          return 'Неверный формат цвета. Используйте формат #RRGGBB'
        }
        return true
      },
    },
    {
      name: 'totalPredictions',
      type: 'number',
      defaultValue: 0,
      label: 'Всего прогнозов',
      admin: {
        description: 'Автоматически обновляется при создании прогнозов',
        readOnly: true,
      },
    },
    {
      name: 'currentStreak',
      type: 'number',
      defaultValue: 0,
      label: 'Текущий стрик',
      admin: {
        description: 'Количество гонок подряд с прогнозами (обновляется автоматически)',
        readOnly: true,
      },
    },
    {
      name: 'name',
      type: 'text',
      label: 'Полное имя (опционально)',
    },
    {
      name: 'roles',
      type: 'select',
      access: {
        create: adminOnlyFieldAccess,
        read: adminOnlyFieldAccess,
        update: adminOnlyFieldAccess,
      },
      defaultValue: ['user'],
      hasMany: true,
      hooks: {
        beforeChange: [ensureFirstUserIsAdmin],
      },
      options: [
        {
          label: 'admin',
          value: 'admin',
        },
        {
          label: 'user',
          value: 'user',
        },
      ],
    },
  ],
}
