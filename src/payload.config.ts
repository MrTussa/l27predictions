// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'

import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { submitEventResponse } from '@/api/events/submitEventResponse'
import { createPrediction } from '@/api/predictions/createPrediction'
import { updatePrediction } from '@/api/predictions/updatePrediction'
import { Drivers } from '@/collections/Drivers'
import { EventResponses } from '@/collections/EventResponses'
import { F1Events } from '@/collections/Events'
import { Media } from '@/collections/Media'
import { Predictions } from '@/collections/Predictions'
import { Races } from '@/collections/Races'
import { SeasonStats } from '@/collections/SeasonStats'
import { Teams } from '@/collections/Teams'
import { Users } from '@/collections/Users'
import { Footer } from '@/globals/Footer'
import { Header } from '@/globals/Header'
import { plugins } from './plugins'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {},
    user: Users.slug,
  },
  collections: [
    Users,
    Teams,
    Drivers,
    Races,
    Predictions,
    SeasonStats,
    F1Events,
    EventResponses,
    Media,
  ],
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  editor: lexicalEditor(),
  //email: nodemailerAdapter(),
  endpoints: [
    {
      path: '/predictions',
      method: 'post',
      handler: createPrediction,
    },
    {
      path: '/predictions/:id',
      method: 'patch',
      handler: updatePrediction,
    },
    {
      path: '/event-responses',
      method: 'post',
      handler: submitEventResponse,
    },
  ],
  globals: [Header, Footer],
  plugins: [
    ...plugins,
    // storage-adapter-placeholder
  ],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Sharp is now an optional dependency -
  // if you want to resize images, crop, set focal point, etc.
  // make sure to install it and pass it to the config.
  // sharp,
})
