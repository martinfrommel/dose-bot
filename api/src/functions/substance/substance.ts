import type { APIGatewayEvent, Context } from 'aws-lambda'

import { ApiCall } from 'src/lib/ApiCall'
import { db } from 'src/lib/db'
import { logger } from 'src/lib/logger'

/**
 * Handler for single substance operations
 * GET /substance/:id - Get a specific substance (by ID or slug)
 * PUT /substance/:id - Update a specific substance
 * DELETE /substance/:id - Delete a specific substance
 */
export const handler = async (event: APIGatewayEvent, context: Context) => {
  const apiCall = new ApiCall(event, context)

  try {
    // Authenticate the request
    const authError = await apiCall.authenticate()
    if (authError) {
      return authError
    }

    logger.info(`${apiCall.method} ${apiCall.path}: substance function`)

    // Handle different HTTP methods
    switch (apiCall.method) {
      case 'GET':
        return await handleGet(apiCall)
      case 'PUT':
        return await handlePut(apiCall)
      case 'DELETE':
        return await handleDelete(apiCall)
      default:
        return apiCall.methodNotAllowed(['GET', 'PUT', 'DELETE'])
    }
  } catch (error) {
    logger.error('Error in substance handler:', error)
    return apiCall.serverError('An unexpected error occurred', error as Error)
  }
}

/**
 * Handle GET requests - Retrieve a specific substance by ID or slug
 */
async function handleGet(apiCall: ApiCall) {
  const { id } = apiCall.pathParams

  if (!id) {
    return apiCall.badRequest('Substance ID or slug is required in the path')
  }

  try {
    // Try to find by ID first, then by slug
    const substance = await db.substance.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        doses: {
          orderBy: {
            amount: 'asc',
          },
        },
      },
    })

    if (!substance) {
      return apiCall.notFound(`Substance with ID or slug ${id} not found`)
    }

    return apiCall.success(substance)
  } catch (error) {
    logger.error('Error retrieving substance:', error)
    return apiCall.serverError('Failed to retrieve substance', error as Error)
  }
}

/**
 * Handle PUT requests - Update a substance
 */
async function handlePut(apiCall: ApiCall) {
  const { id } = apiCall.pathParams
  const body = apiCall.body

  if (!id) {
    return apiCall.badRequest('Substance ID or slug is required in the path')
  }

  if (!body) {
    return apiCall.badRequest('Request body is required')
  }

  try {
    // Check if substance exists
    const existingSubstance = await db.substance.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    })

    if (!existingSubstance) {
      return apiCall.notFound(`Substance with ID or slug ${id} not found`)
    }

    // Update the substance
    const substance = await db.substance.update({
      where: { id: existingSubstance.id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && {
          description: body.description,
        }),
        ...(body.slug !== undefined && { slug: body.slug }),
      },
      include: {
        doses: {
          orderBy: {
            amount: 'asc',
          },
        },
      },
    })

    return apiCall.success(substance)
  } catch (error) {
    logger.error('Error updating substance:', error)
    return apiCall.serverError('Failed to update substance', error as Error)
  }
}

/**
 * Handle DELETE requests - Delete a substance
 */
async function handleDelete(apiCall: ApiCall) {
  const { id } = apiCall.pathParams

  if (!id) {
    return apiCall.badRequest('Substance ID or slug is required in the path')
  }

  try {
    // Check if substance exists
    const existingSubstance = await db.substance.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    })

    if (!existingSubstance) {
      return apiCall.notFound(`Substance with ID or slug ${id} not found`)
    }

    // Delete the substance (cascade will delete related doses)
    await db.substance.delete({
      where: { id: existingSubstance.id },
    })

    return apiCall.noContent()
  } catch (error) {
    logger.error('Error deleting substance:', error)
    return apiCall.serverError('Failed to delete substance', error as Error)
  }
}
