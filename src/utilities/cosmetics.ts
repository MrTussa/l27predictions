// Pit Coins cosmetic shop catalog.
// ponytail: static config, not a CMS collection. Move to a Payload collection
// only if items need to change without a deploy.

export type Cosmetic = {
  id: string
  name: string
  description: string
  price: number
  type: 'nickname-effect'
  /** CSS class applied to the nickname span (defined in globals.css). */
  className: string
  /** Representative color used to tint the shop card (Card accentColor). */
  accentColor: string
}

export const COSMETICS: Cosmetic[] = [
  {
    id: 'gold-gradient',
    name: 'Золотой',
    description: 'Золотой градиент — статус чемпиона.',
    price: 50,
    type: 'nickname-effect',
    className: 'nick-gold-gradient',
    accentColor: '#FFDF2C',
  },
  {
    id: 'glow',
    name: 'Неон',
    description: 'Неоновое свечение фирменного жёлтого.',
    price: 100,
    type: 'nickname-effect',
    className: 'nick-glow',
    accentColor: '#FFE45E',
  },
  {
    id: 'fire',
    name: 'Пламя',
    description: 'Огненный градиент от жёлтого к красному.',
    price: 150,
    type: 'nickname-effect',
    className: 'nick-fire',
    accentColor: '#FF6A00',
  },
  {
    id: 'ice',
    name: 'Лёд',
    description: 'Ледяное голубое свечение.',
    price: 150,
    type: 'nickname-effect',
    className: 'nick-ice',
    accentColor: '#78D2FF',
  },
  {
    id: 'shimmer',
    name: 'Мерцание',
    description: 'Анимированный блик, скользящий по нику.',
    price: 250,
    type: 'nickname-effect',
    className: 'nick-shimmer',
    accentColor: '#CFCFCF',
  },
  {
    id: 'rainbow',
    name: 'Радуга',
    description: 'Переливающийся радужный градиент.',
    price: 400,
    type: 'nickname-effect',
    className: 'nick-rainbow',
    accentColor: '#B02DFF',
  },
]

export const COSMETICS_BY_ID: Record<string, Cosmetic> = Object.fromEntries(
  COSMETICS.map((c) => [c.id, c]),
)

/** CSS class for an equipped effect id, or '' if none/unknown. */
export function cosmeticClass(effectId: string | null | undefined): string {
  if (!effectId) return ''
  return COSMETICS_BY_ID[effectId]?.className ?? ''
}
