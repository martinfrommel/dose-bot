/**
 * Simple in-memory rate limiter for login attempts
 * Tracks failed attempts by IP address and blocks after too many failures
 */

interface RateLimitEntry {
  attempts: number
  firstAttempt: number
  blockedUntil?: number
}

// In-memory store for rate limiting
// In production with multiple instances, consider using Redis
const rateLimitStore = new Map<string, RateLimitEntry>()

// Configuration
const MAX_ATTEMPTS = 5 // Maximum login attempts before blocking
const WINDOW_MS = 15 * 60 * 1000 // 15 minute window
const BLOCK_DURATION_MS = 15 * 60 * 1000 // Block for 15 minutes after max attempts

/**
 * Clean up expired entries from the store
 */
const cleanupExpiredEntries = () => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    // Remove entries that are no longer blocked and outside the window
    if (
      (!entry.blockedUntil || entry.blockedUntil < now) &&
      now - entry.firstAttempt > WINDOW_MS
    ) {
      rateLimitStore.delete(key)
    }
  }
}

// Run cleanup periodically (every 5 minutes)
setInterval(cleanupExpiredEntries, 5 * 60 * 1000)

/**
 * Check if a given identifier (typically IP address) is rate limited
 * @param identifier - The identifier to check (IP address, user ID, etc.)
 * @returns Object with isBlocked status and remaining time if blocked
 */
export const checkRateLimit = (
  identifier: string
): {
  isBlocked: boolean
  retryAfterMs?: number
  attemptsRemaining?: number
} => {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  if (!entry) {
    return { isBlocked: false, attemptsRemaining: MAX_ATTEMPTS }
  }

  // Check if currently blocked
  if (entry.blockedUntil && entry.blockedUntil > now) {
    return {
      isBlocked: true,
      retryAfterMs: entry.blockedUntil - now,
    }
  }

  // Reset if outside the window
  if (now - entry.firstAttempt > WINDOW_MS) {
    rateLimitStore.delete(identifier)
    return { isBlocked: false, attemptsRemaining: MAX_ATTEMPTS }
  }

  return {
    isBlocked: false,
    attemptsRemaining: Math.max(0, MAX_ATTEMPTS - entry.attempts),
  }
}

/**
 * Record a failed login attempt for the given identifier
 * @param identifier - The identifier to record the attempt for
 * @returns Object with isBlocked status after recording the attempt
 */
export const recordFailedAttempt = (
  identifier: string
): { isBlocked: boolean; retryAfterMs?: number } => {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  if (!entry || now - entry.firstAttempt > WINDOW_MS) {
    // First attempt in a new window
    rateLimitStore.set(identifier, {
      attempts: 1,
      firstAttempt: now,
    })
    return { isBlocked: false }
  }

  // Increment attempts
  entry.attempts++

  // Check if should be blocked
  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.blockedUntil = now + BLOCK_DURATION_MS
    return {
      isBlocked: true,
      retryAfterMs: BLOCK_DURATION_MS,
    }
  }

  return { isBlocked: false }
}

/**
 * Clear rate limit for an identifier (e.g., after successful login)
 * @param identifier - The identifier to clear
 */
export const clearRateLimit = (identifier: string): void => {
  rateLimitStore.delete(identifier)
}

/**
 * Extract client IP from event headers (works with various proxies)
 * @param event - API Gateway event
 * @returns The client IP address
 */
export const getClientIp = (event: {
  headers?: Record<string, string | undefined>
  requestContext?: { identity?: { sourceIp?: string } }
}): string => {
  // Check common proxy headers first
  const forwardedFor = event.headers?.['x-forwarded-for']
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = event.headers?.['x-real-ip']
  if (realIp) {
    return realIp
  }

  // Fall back to direct connection IP
  return event.requestContext?.identity?.sourceIp || 'unknown'
}
