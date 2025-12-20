import type { APIGatewayEvent, Context } from 'aws-lambda'

import { ApiCall } from 'src/lib/ApiCall'
import { logger } from 'src/lib/logger'

/**
 * Health check function to verify that the API is running.
 * Returns a simple JSON response indicating the service status.
 * @param event - The API Gateway event.
 * @param context - The Lambda execution context.
 * @returns A JSON response with the service status.
 */
export const handler = async (event: APIGatewayEvent, context: Context) => {
  const call = new ApiCall(event, context)
  logger.info('Health function invoked', { event })

  return call.success()
}
