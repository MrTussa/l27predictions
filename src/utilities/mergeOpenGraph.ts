import type { Metadata } from 'next'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description:
    'Чемпионат по прогнозам Формулы 1 — делайте прогнозы на результаты гонок и соревнуйтесь с друзьями за первое место в таблице лидеров',
  images: [
    {
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'L27 F1 Predictions',
    },
  ],
  siteName: 'L27 F1 Predictions',
  title: 'L27 F1 Predictions — Чемпионат прогнозов Формулы 1',
  locale: 'ru_RU',
}

export const mergeOpenGraph = (og?: Partial<Metadata['openGraph']>): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
