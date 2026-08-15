import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { s3Storage } from '@payloadcms/storage-s3'

import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { isAdmin } from '@/access'
import { submitEventResponse } from '@/api/events/submitEventResponse'
import { submitRaceRating } from '@/api/race-ratings/submitRaceRating'
import { shop } from '@/api/shop/shop'
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
import { importFinishedRaces } from '@/jobs/importFinishedRaces'

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
  jobs: {
    tasks: [importFinishedRaces],
    // `schedule` у задачи ставит job в очередь, autoRun — исполняет её.
    // Нужны оба; работает на долгоживущем Node-процессе (`next start`).
    autoRun: [{ cron: '*/5 * * * *', queue: 'openf1', limit: 3 }],
    shouldAutoRun: () => process.env.DISABLE_JOBS !== 'true',
    // Тик раз в 10 минут — записи выполненных job'ов не копим. Для отладки временно
    // поставить false, тогда результат прогона виден в коллекции `payload-jobs`.
    deleteJobOnComplete: true,
    access: {
      run: ({ req }) => isAdmin(req.user),
    },
  },
  endpoints: [
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
    {
      path: '/shop',
      method: 'post',
      handler: shop,
    },
  ],
  plugins: [
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
