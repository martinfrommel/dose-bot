import crypto from 'node:crypto'

import { db } from 'api/src/lib/db.js'
// Manually apply seeds via the `yarn cedar prisma db seed` command.
//
// Seeds automatically run the first time you run the `yarn cedar prisma migrate dev`
// command and every time you run the `yarn cedar prisma migrate reset` command.
//
// See https://cedarjs.com/docs/database-seeds for more info

export default async () => {
  try {
    // Generate a default API on a new database instance
    const apiKey = await db.apiKey.create({
      data: {
        key: crypto.randomBytes(16).toString('base64'),
        description: 'Default API Key, valid for 1 year',
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    })
    console.log(`Generated default API Key: ${apiKey.key}`)
  } catch (error) {
    console.error(error)
  }
}
