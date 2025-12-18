/**
 * Converts a string to a URL-friendly slug
 * @param text The text to slugify
 * @returns A URL-friendly slug
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w-]/g, '') // Remove all non-word characters (except hyphens)
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
}
