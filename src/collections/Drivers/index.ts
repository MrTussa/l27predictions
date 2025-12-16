import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { publicAccess } from '@/access/publicAccess'

export const Drivers: CollectionConfig = {
  slug: 'drivers',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: publicAccess,
    update: adminOnly,
  },
  admin: {
    group: 'F1 Championship',
    defaultColumns: ['name', 'shortName', 'number', 'team', 'season', 'isActive'],
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Полное имя',
    },
    {
      name: 'shortName',
      type: 'text',
      required: true,
      maxLength: 3,
      label: 'Аббревиатура (например, VER)',
    },
    {
      name: 'number',
      type: 'number',
      required: true,
      min: 1,
      max: 99,
      label: 'Гоночный номер',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Фото пилота',
    },
    {
      name: 'team',
      type: 'text',
      label: 'Команда',
      admin: {
        description: 'Например: Red Bull Racing, Ferrari',
      },
    },
    {
      name: 'teamColor',
      type: 'text',
      label: 'Цвет команды (HEX)',
      admin: {
        description: 'Например: #0600EF для Red Bull',
      },
      validate: (val: string | null | undefined) => {
        if (val && !/^#[0-9A-F]{6}$/i.test(val)) {
          return 'Неверный формат цвета. Используйте формат #RRGGBB'
        }
        return true
      },
    },
    {
      name: 'countryFlag',
      type: 'upload',
      relationTo: 'media',
      label: 'Флаг страны',
      admin: {
        description: 'Флаг страны рождения пилота',
      },
    },
    {
      name: 'season',
      type: 'number',
      required: true,
      defaultValue: () => new Date().getFullYear(),
      label: 'Сезон',
      admin: {
        description: 'Год сезона (например, 2025)',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: 'Активен (доступен для прогнозов)',
      admin: {
        description: 'Снимите галочку, чтобы скрыть пилота из списка для прогнозов',
      },
    },
  ],
}
