import type { APIGatewayEvent, Context } from 'aws-lambda'

import { db } from './db'
import { verifyApiKey, validateApiKeyEnabled } from './hash'
import { logger } from './logger'

interface ApiResponse {
  statusCode: number
  headers: Record<string, string>
  body: string
}

interface ApiCallOptions {
  requireAuth?: boolean
}

/**
 * ApiCall class to handle API requests with authentication and standard responses
 */
export class ApiCall {
  private event: APIGatewayEvent
  private context: Context
  private options: ApiCallOptions
  private apiKey?: string

  constructor(
    event: APIGatewayEvent,
    context: Context,
    options: ApiCallOptions = {}
  ) {
    this.event = event
    this.context = context
    this.options = { requireAuth: true, ...options }
  }

  /**
   * Extract API key from Authorization header
   */
  private extractApiKey(): string | undefined {
    const authHeader =
      this.event.headers?.Authorization || this.event.headers?.authorization

    if (!authHeader) {
      return undefined
    }

    // Support "Bearer <token>" format
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7)
    }

    // Support direct key format
    return authHeader
  }

  /**
   * Validate the API key from the request
   */
  async validateApiKey(): Promise<boolean> {
    const key = this.extractApiKey()

    if (!key) {
      return false
    }

    this.apiKey = key

    // Fetch all API keys and check each one with bcrypt compare
    const allKeys = await db.apiKey.findMany()

    for (const dbKey of allKeys) {
      // Use the verifyApiKey function that uses bcrypt.compare
      const isMatch = await verifyApiKey(key, dbKey.hashedKey)

      if (
        isMatch &&
        validateApiKeyEnabled({
          enabled: dbKey.enabled,
          validUntil: dbKey.validUntil,
        })
      ) {
        return true
      }
    }

    return false
  }

  /**
   * Check authentication and return error response if invalid
   */
  async authenticate(): Promise<ApiResponse | null> {
    if (!this.options.requireAuth) {
      return null
    }

    const isValid = await this.validateApiKey()

    if (!isValid) {
      logger.warn(
        `${this.event.httpMethod} ${this.event.path}: Unauthorized request`
      )
      return this.unauthorized('Invalid or missing API key')
    }

    return null
  }

  /**
   * Get request method
   */
  get method(): string {
    return this.event.httpMethod
  }

  /**
   * Get request path
   */
  get path(): string {
    return this.event.path
  }

  /**
   * Get query parameters
   */
  get queryParams(): Record<string, string | undefined> {
    return this.event.queryStringParameters || {}
  }

  /**
   * Get path parameters
   */
  get pathParams(): Record<string, string | undefined> {
    return this.event.pathParameters || {}
  }

  /**
   * Get request body (parsed as JSON if applicable)
   */
  get body(): any {
    if (!this.event.body) {
      return null
    }

    try {
      return JSON.parse(this.event.body)
    } catch {
      return this.event.body
    }
  }

  /**
   * Create a standardized response
   */
  private createResponse(
    statusCode: number,
    data: any,
    headers: Record<string, string> = {}
  ): ApiResponse {
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    }
  }

  /**
   * 200 OK - Success response
   */
  success(data: any, headers?: Record<string, string>): ApiResponse {
    logger.info(`${this.method} ${this.path}: 200 OK`)
    return this.createResponse(200, { success: true, data }, headers)
  }

  /**
   * 201 Created - Resource created successfully
   */
  created(data: any, headers?: Record<string, string>): ApiResponse {
    logger.info(`${this.method} ${this.path}: 201 Created`)
    return this.createResponse(201, { success: true, data }, headers)
  }

  /**
   * 204 No Content - Success with no response body
   */
  noContent(): ApiResponse {
    logger.info(`${this.method} ${this.path}: 204 No Content`)
    return {
      statusCode: 204,
      headers: {},
      body: '',
    }
  }

  /**
   * 400 Bad Request - Invalid request
   */
  badRequest(message: string, errors?: any): ApiResponse {
    logger.warn(`${this.method} ${this.path}: 400 Bad Request - ${message}`)
    return this.createResponse(400, {
      success: false,
      error: message,
      ...(errors && { errors }),
    })
  }

  /**
   * 401 Unauthorized - Authentication required
   */
  unauthorized(message = 'Unauthorized'): ApiResponse {
    logger.warn(`${this.method} ${this.path}: 401 Unauthorized - ${message}`)
    return this.createResponse(401, {
      success: false,
      error: message,
    })
  }

  /**
   * 403 Forbidden - Authentication succeeded but access denied
   */
  forbidden(message = 'Forbidden'): ApiResponse {
    logger.warn(`${this.method} ${this.path}: 403 Forbidden - ${message}`)
    return this.createResponse(403, {
      success: false,
      error: message,
    })
  }

  /**
   * 404 Not Found - Resource not found
   */
  notFound(message = 'Resource not found'): ApiResponse {
    logger.warn(`${this.method} ${this.path}: 404 Not Found - ${message}`)
    return this.createResponse(404, {
      success: false,
      error: message,
    })
  }

  /**
   * 405 Method Not Allowed - HTTP method not supported
   */
  methodNotAllowed(allowedMethods: string[] = []): ApiResponse {
    logger.warn(
      `${this.method} ${this.path}: 405 Method Not Allowed - Allowed: ${allowedMethods.join(', ')}`
    )
    return this.createResponse(
      405,
      {
        success: false,
        error: 'Method not allowed',
        allowedMethods,
      },
      allowedMethods.length > 0 ? { Allow: allowedMethods.join(', ') } : {}
    )
  }

  /**
   * 409 Conflict - Resource conflict
   */
  conflict(message = 'Resource conflict'): ApiResponse {
    logger.warn(`${this.method} ${this.path}: 409 Conflict - ${message}`)
    return this.createResponse(409, {
      success: false,
      error: message,
    })
  }

  /**
   * 422 Unprocessable Entity - Validation error
   */
  unprocessableEntity(message: string, errors?: any): ApiResponse {
    logger.warn(
      `${this.method} ${this.path}: 422 Unprocessable Entity - ${message}`
    )
    return this.createResponse(422, {
      success: false,
      error: message,
      ...(errors && { errors }),
    })
  }

  /**
   * 429 Too Many Requests - Rate limit exceeded
   */
  tooManyRequests(
    message = 'Too many requests',
    retryAfter?: number
  ): ApiResponse {
    logger.warn(
      `${this.method} ${this.path}: 429 Too Many Requests - ${message}`
    )
    return this.createResponse(
      429,
      {
        success: false,
        error: message,
      },
      retryAfter ? { 'Retry-After': retryAfter.toString() } : {}
    )
  }

  /**
   * 500 Internal Server Error - Server error
   */
  serverError(message = 'Internal server error', error?: Error): ApiResponse {
    logger.error(
      `${this.method} ${this.path}: 500 Internal Server Error - ${message}`,
      error
    )
    return this.createResponse(500, {
      success: false,
      error: message,
      ...(process.env.NODE_ENV === 'development' &&
        error && {
          stack: error.stack,
        }),
    })
  }

  /**
   * 503 Service Unavailable - Service temporarily unavailable
   */
  serviceUnavailable(
    message = 'Service unavailable',
    retryAfter?: number
  ): ApiResponse {
    logger.error(
      `${this.method} ${this.path}: 503 Service Unavailable - ${message}`
    )
    return this.createResponse(
      503,
      {
        success: false,
        error: message,
      },
      retryAfter ? { 'Retry-After': retryAfter.toString() } : {}
    )
  }
}
