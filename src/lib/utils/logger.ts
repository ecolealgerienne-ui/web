/**
 * Service de logging centralisé
 *
 * En mode DEV: Console uniquement
 * En mode PROD: Peut s'intégrer avec Sentry, LogRocket, DataDog, etc.
 *
 * Usage:
 * import { logger } from '@/lib/utils/logger'
 * logger.info('Message info', { data: '...' })
 * logger.error('Message erreur', { error })
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: any
}

const isDevelopment = process.env.NODE_ENV === 'development'
const isServer = typeof window === 'undefined'

class Logger {
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const env = isDevelopment ? 'DEV' : 'PROD'
    const side = isServer ? 'SERVER' : 'CLIENT'
    return `[${timestamp}] [${env}] [${side}] [${level.toUpperCase()}] ${message}`
  }

  private shouldLog(level: LogLevel): boolean {
    // En dev, tout logger
    if (isDevelopment) return true

    // En prod, ne pas logger les debug
    if (level === 'debug') return false

    return true
  }

  private sendToExternalService(
    level: LogLevel,
    message: string,
    context?: LogContext
  ) {
    // TODO: Intégrer avec un service externe en production
    // Exemples d'intégrations possibles:

    // Sentry
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   if (level === 'error') {
    //     Sentry.captureException(new Error(message), { extra: context })
    //   } else {
    //     Sentry.captureMessage(message, { level, extra: context })
    //   }
    // }

    // LogRocket
    // if (typeof window !== 'undefined' && window.LogRocket) {
    //   LogRocket.log(message, context)
    // }

    // Custom API endpoint
    // if (!isServer) {
    //   fetch('/api/logs', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ level, message, context, timestamp: new Date() })
    //   }).catch(() => {})
    // }
  }

  debug(message: string, context?: LogContext) {
    if (!this.shouldLog('debug')) return

    const formattedMessage = this.formatMessage('debug', message, context)
    console.debug(formattedMessage, context || '')
  }

  info(message: string, context?: LogContext) {
    if (!this.shouldLog('info')) return

    const formattedMessage = this.formatMessage('info', message, context)
    console.info(formattedMessage, context || '')

    if (!isDevelopment) {
      this.sendToExternalService('info', message, context)
    }
  }

  warn(message: string, context?: LogContext) {
    if (!this.shouldLog('warn')) return

    const formattedMessage = this.formatMessage('warn', message, context)
    console.warn(formattedMessage, context || '')

    if (!isDevelopment) {
      this.sendToExternalService('warn', message, context)
    }
  }

  error(message: string, context?: LogContext) {
    if (!this.shouldLog('error')) return

    const formattedMessage = this.formatMessage('error', message, context)
    console.error(formattedMessage, context || '')

    // Toujours envoyer les erreurs au service externe
    if (!isDevelopment) {
      this.sendToExternalService('error', message, context)
    }
  }

  // Méthode spéciale pour logger les erreurs HTTP
  httpError(
    method: string,
    url: string,
    status: number,
    error?: any,
    context?: LogContext
  ) {
    this.error(`HTTP ${method} ${url} failed with status ${status}`, {
      method,
      url,
      status,
      error: error?.message || error,
      ...context,
    })
  }
}

// Instance singleton du logger
export const logger = new Logger()

// Helper pour capturer les erreurs async
export function captureAsyncError<T>(
  promise: Promise<T>,
  errorMessage: string
): Promise<T> {
  return promise.catch((error) => {
    logger.error(errorMessage, { error: error.message, stack: error.stack })
    throw error
  })
}

// Helper pour wrapper les fonctions avec error logging
export function withErrorLogging<T extends (...args: any[]) => any>(
  fn: T,
  errorMessage: string
): T {
  return ((...args: any[]) => {
    try {
      const result = fn(...args)
      if (result instanceof Promise) {
        return result.catch((error) => {
          logger.error(errorMessage, { error: error.message, stack: error.stack })
          throw error
        })
      }
      return result
    } catch (error: any) {
      logger.error(errorMessage, { error: error.message, stack: error.stack })
      throw error
    }
  }) as T
}
