/**
 * Conditional logger that only logs in development mode
 * Helps reduce console noise in production while keeping debug info in dev
 */

const isDev = process.env.NODE_ENV === 'development'

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args)
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args)
  },
  error: (...args: unknown[]) => {
    // Always log errors, but with less verbosity in production
    if (isDev) {
      console.error(...args)
    } else {
      // In production, only log the first argument (usually the message)
      console.error(args[0])
    }
  },
  debug: (...args: unknown[]) => {
    if (isDev) console.debug(...args)
  },
}
