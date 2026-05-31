/**
 * Format a byte count into a human-readable string.
 * e.g. 1536 → "1.5 KB"
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

/**
 * Format a percentage reduction value.
 * e.g. 0.342 → "34%"
 */
export function formatReduction(ratio: number): string {
  return `${Math.round(ratio * 100)}%`
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
