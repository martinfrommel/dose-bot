/**
 * Sanitize email to lowercase for case-insensitive operations
 */
export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim()
}
