import type { APIGatewayEvent, Context } from 'aws-lambda'

import { ApiCall } from 'src/lib/ApiCall'
import { db } from 'src/lib/db'
import { logger } from 'src/lib/logger'
import { slugify } from 'src/lib/slug'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isUnit = (value: unknown): value is 'MG' | 'ML' | 'G' | 'IU' =>
  value === 'MG' || value === 'ML' || value === 'G' || value === 'IU'

/**
 * Handler for multiple substances operations
 * GET /substances - List all substances
 * POST /substances - Create a new substance
 */
export const handler = async (event: APIGatewayEvent, context: Context) => {
  const apiCall = new ApiCall(event, context)

  try {
    // Authenticate the request
    const authError = await apiCall.authenticate()
    if (authError) {
      return authError
    }

    logger.info(`${apiCall.method} ${apiCall.path}: substances function`)

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
    logger.error('Error in substances handler:', error)
    return apiCall.serverError('An unexpected error occurred', error as Error)
  }
}

/**
 * Handle GET requests - Retrieve all substances
 */
async function handleGet(apiCall: ApiCall) {
  const { includeDoses } = apiCall.queryParams

  try {
    const substances = await db.substance.findMany({
      include: {
        doses: includeDoses === 'true',
      },
      orderBy: {
        name: 'asc',
      },
    })

    return apiCall.success(substances)
  } catch (error) {
    logger.error('Error retrieving substances:', error)
    return apiCall.serverError('Failed to retrieve substances', error as Error)
  }
}

/**
 * Handle POST requests - Create a new substance
 */
async function handlePost(apiCall: ApiCall) {
  const body = apiCall.body

  if (!isRecord(body)) {
    return apiCall.badRequest('Request body must be a JSON object')
  }

  if (!body.name || !body.unit) {
    return apiCall.badRequest(
      'Missing required fields: name and unit are required'
    )
  }

  const name = String(body.name)

  if (!isUnit(body.unit)) {
    return apiCall.badRequest('Unit must be one of: MG, ML, G, IU')
  }

  const unit = body.unit

  try {
    // Generate slug if not provided
    const slug = typeof body.slug === 'string' ? body.slug : slugify(name)

    // Check if slug already exists
    const existingSubstance = await db.substance.findFirst({
      where: { slug },
    })

    if (existingSubstance) {
      return apiCall.conflict(`A substance with slug "${slug}" already exists`)
    }

    // Create the substance
    const substance = await db.substance.create({
      data: {
        name,
        slug,
        description:
          typeof body.description === 'string' ? body.description : null,
        unit,
      },
    })

    return apiCall.created(substance)
  } catch (error) {
    logger.error('Error creating substance:', error)
    return apiCall.serverError('Failed to create substance', error as Error)
  }
}
