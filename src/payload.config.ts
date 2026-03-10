import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { s3Storage } from '@payloadcms/storage-s3'

import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { submitEventResponse } from '@/api/events/submitEventResponse'
import { createPrediction } from '@/api/predictions/createPrediction'
import { updatePrediction } from '@/api/predictions/updatePrediction'
import { submitRaceRating } from '@/api/race-ratings/submitRaceRating'
import { Drivers } from '@/collections/Drivers'
import { EventResponses } from '@/collections/EventResponses'
import { F1Events } from '@/collections/Events'
import { Media } from '@/collections/Media'
import { Predictions } from '@/collections/Predictions'
import { RaceRatings } from '@/collections/RaceRatings'
import { Races } from '@/collections/Races'
import { SeasonStats } from '@/collections/SeasonStats'
import { Teams } from '@/collections/Teams'
import { Users } from '@/collections/Users'
import { BroadcastSettings } from '@/globals/BroadcastSettings'
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
    RaceRatings,
    SeasonStats,
    F1Events,
    EventResponses,
    Media,
  ],
  globals: [BroadcastSettings],
  defaultDepth: 0,
  maxDepth: 3,
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  editor: lexicalEditor(),
  email: nodemailerAdapter({
    defaultFromAddress: 'noreply@limonov27.ru',
    defaultFromName: 'L27Predictions',
    transportOptions: {
      host: process.env.SMTP_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
  }),
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
    {
      path: '/update-race-ratings',
      method: 'post',
      handler: submitRaceRating,
    },
  ],
  plugins: [
    ...plugins,
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.S3_BUCKET!,
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
        region: process.env.S3_REGION!,
        endpoint: process.env.S3_ENDPOINT,
        forcePathStyle: true,
      },
    }),
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
