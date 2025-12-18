import type { APIGatewayEvent, Context } from 'aws-lambda'

import { ApiCall } from 'src/lib/ApiCall'
import { db } from 'src/lib/db'
import { logger } from 'src/lib/logger'

/**
 * Handler for multiple doses operations
 * GET /doses - List all doses with optional filtering
 * POST /doses - Create a new dose
 */
export const handler = async (event: APIGatewayEvent, context: Context) => {
  const apiCall = new ApiCall(event, context)

  try {
    // Authenticate the request
    const authError = await apiCall.authenticate()
    if (authError) {
      return authError
    }

    logger.info(`${apiCall.method} ${apiCall.path}: doses function`)

    // Handle different HTTP methods
    switch (apiCall.method) {
      case 'GET':
        return await handleGet(apiCall)
      case 'POST':
        return await handlePost(apiCall)
      default:
        return apiCall.methodNotAllowed(['GET', 'POST'])
    }
  } catch (error) {
    logger.error('Error in doses handler:', error)
    return apiCall.serverError('An unexpected error occurred', error as Error)
  }
}

/**
 * Handle GET requests - Retrieve multiple doses with optional filtering
 */
async function handleGet(apiCall: ApiCall) {
  const { substanceId, slug } = apiCall.queryParams

  try {
    // Build where clause based on query parameters
    const where: any = {}

    if (substanceId) {
      where.substanceId = substanceId
    } else if (slug) {
      // Find substance by slug first
      const substance = await db.substance.findUnique({
        where: { slug },
      })

      if (!substance) {
        return apiCall.notFound(`Substance with slug ${slug} not found`)
      }

      where.substanceId = substance.id
    }

    const doses = await db.dose.findMany({
      where,
      include: {
        substance: true,
      },
      orderBy: {
        amount: 'asc',
      },
    })

    return apiCall.success(doses)
  } catch (error) {
    logger.error('Error retrieving doses:', error)
    return apiCall.serverError('Failed to retrieve doses', error as Error)
  }
}

/**
 * Handle POST requests - Create a new dose
 */
async function handlePost(apiCall: ApiCall) {
  const body = apiCall.body

  if (!body || !body.amount || !body.unit || !body.substanceId) {
    return apiCall.badRequest(
      'Missing required fields: amount, unit, and substanceId are required'
    )
  }

  try {
    // Verify substance exists
    const substance = await db.substance.findUnique({
      where: { id: body.substanceId },
    })

    if (!substance) {
      return apiCall.notFound(`Substance with ID ${body.substanceId} not found`)
    }

    // Create the dose
    const dose = await db.dose.create({
      data: {
        amount: body.amount,
        unit: body.unit,
        substanceId: body.substanceId,
      },
      include: {
        substance: true,
      },
    })

    return apiCall.created(dose)
  } catch (error) {
    logger.error('Error creating dose:', error)
    return apiCall.serverError('Failed to create dose', error as Error)
  }
}
