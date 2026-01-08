import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { publicAccess } from '@/access/publicAccess'

export const Teams: CollectionConfig = {
  slug: 'teams',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: publicAccess,
    update: adminOnly,
  },
  admin: {
    group: 'F1 Championship',
    defaultColumns: ['name', 'teamColor', 'season', 'isActive'],
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Название команды',
      admin: {
        description: 'Например: Red Bull Racing, Mercedes-AMG Petronas',
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Логотип команды',
    },
    {
      name: 'teamColor',
      type: 'text',
      required: true,
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
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: 'Активна (доступна для прогнозов)',
      admin: {
        description: 'Снимите галочку, чтобы скрыть команду из списка для прогнозов',
      },
    },
  ],
}
