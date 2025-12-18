import { db } from './db'
import { hashApiKey, validateApiKeyEnabled } from './hash'

/*
  Validates an API key by checking if its hashed version exists in the database.
  @param key - The API key to validate.
  @returns A promise that resolves to true if the API key is valid, false otherwise.
*/
export const validateApiKey = async (key: string): Promise<boolean> => {
  const dbKey = await db.apiKey.findFirst({
    where: { hashedKey: await hashApiKey(key) },
  })

  if (
    dbKey &&
    validateApiKeyEnabled({
      enabled: dbKey.enabled,
      validUntil: dbKey.validUntil,
    })
  ) {
    return true
  } else {
    return false
  }
}
