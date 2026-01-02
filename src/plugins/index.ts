import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { Plugin } from 'payload'

import { getServerSideURL } from '@/utilities/getURL'

const generateTitle = ({ doc }: any) => {
  return doc?.title
    ? `${doc.title} | L27 F1 Predictions`
    : 'L27 - Formula 1 Predictions Championship'
}

const generateURL = ({ doc }: any) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formSubmissionOverrides: {
      admin: {
        group: 'Content',
      },
    },
    formOverrides: {
      admin: {
        group: 'Content',
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor(),
            }
          }
          return field
        })
      },
    },
  }),
]
