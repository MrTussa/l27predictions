import { seoPlugin } from '@payloadcms/plugin-seo'
import { Plugin } from 'payload'

import { getServerSideURL } from '@/utilities/getURL'

const generateTitle = ({ doc }: { doc: { title?: string } }) => {
  return doc?.title
    ? `${doc.title} | L27 F1 Predictions`
    : 'L27 - Formula 1 Predictions Championship'
}

const generateURL = ({ doc }: { doc: { slug?: string } }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  seoPlugin({
    generateTitle,
    generateURL,
  }),
]
