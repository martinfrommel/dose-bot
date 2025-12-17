import crypto from 'node:crypto'

import * as bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

/**
 * Generate a random API key
 */
export const generateApiKey = (): string => {
  return crypto.randomBytes(32).toString('base64url')
}

/**
 * Hash an API key using bcrypt
 */
export const hashApiKey = async (key: string): Promise<string> => {
  return bcrypt.hash(key, SALT_ROUNDS)
}

/**
 * Compare a plain text API key with a hashed key
 */
export const verifyApiKey = async (
  plainKey: string,
  hashedKey: string
): Promise<boolean> => {
  return bcrypt.compare(plainKey, hashedKey)
}

/**
 * Validate an API key by checking if it's enabled and not expired
 * If validUntil is null, the key is valid forever
 */
export const validateApiKey = (apiKey: {
  enabled: boolean
  validUntil: Date | null
}): boolean => {
  // Check if the key is enabled
  if (!apiKey.enabled) {
    return false
  }

  // If validUntil is null, the key is valid forever
  if (!apiKey.validUntil) {
    return true
  }

  // Check if the key has expired
  return new Date() < apiKey.validUntil
}
