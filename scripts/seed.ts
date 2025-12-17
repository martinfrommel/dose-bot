import { db } from 'api/src/lib/db.js'
import { generateApiKey, hashApiKey } from 'api/src/lib/hash.js'

// Manually apply seeds via the `yarn cedar prisma db seed` command.
//
// Seeds automatically run the first time you run the `yarn cedar prisma migrate dev`
// command and every time you run the `yarn cedar prisma migrate reset` command.
//
// See https://cedarjs.com/docs/database-seeds for more info

export default async () => {
  try {
    // Generate a default API key on a new database instance
    const plainKey = generateApiKey()
    const hashedKey = await hashApiKey(plainKey)

    const apiKey = await db.apiKey.create({
      data: {
        hashedKey,
        description: 'Default API Key, valid for 1 year',
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    })
    console.log(`Generated default API Key: ${plainKey}`)
    console.log(`API Key ID: ${apiKey.id}`)
    console.log(
      'Store the API Key somewhere safe - you will not be able to see it again!'
    )
  } catch (error) {
    console.error(error)
  }
}
