import type { APIGatewayEvent, Context } from 'aws-lambda'

import { ApiCall } from 'src/lib/ApiCall'
import { db } from 'src/lib/db'
import { logger } from 'src/lib/logger'

/**
 * The handler function is your code that processes http request events.
 * You can use return and throw to send a response or error, respectively.
 *
 * Important: When deployed, a custom serverless function is an open API endpoint and
 * is your responsibility to secure appropriately.
 *
 * @see {@link https://redwoodjs.com/docs/serverless-functions#security-considerations|Serverless Function Considerations}
 * in the RedwoodJS documentation for more information.
 *
 * @param { APIGatewayEvent } event - an object which contains information from the invoker.
 * @param { Context } context - contains information about the invocation,
 * function, and execution environment.
 */
export const handler = async (event: APIGatewayEvent, context: Context) => {
  const apiCall = new ApiCall(event, context)

  try {
    // Authenticate the request
    const authError = await apiCall.authenticate()
    if (authError) {
      return authError
    }

    logger.info(`${apiCall.method} ${apiCall.path}: dose function`)

    // Handle different HTTP methods
    switch (apiCall.method) {
      case 'GET':
        return await handleGet(apiCall)
      case 'POST':
        return await handlePost(apiCall)
      case 'PUT':
        return await handlePut(apiCall)
      case 'DELETE':
        return await handleDelete(apiCall)
      default:
        return apiCall.methodNotAllowed(['GET', 'POST', 'PUT', 'DELETE'])
    }
  } catch (error) {
    logger.error('Error in dose handler:', error)
    return apiCall.serverError('An unexpected error occurred', error as Error)
  }
}

/**
 * Handle GET requests - Retrieve dose(s)
 */
async function handleGet(apiCall: ApiCall) {
  const { id } = apiCall.pathParams
  const { substanceId, slug } = apiCall.queryParams

  try {
    if (id) {
      // Get a specific dose by ID
      const dose = await db.dose.findUnique({
        where: { id },
        include: {
          substance: true,
        },
      })

      if (!dose) {
        return apiCall.notFound(`Dose with ID ${id} not found`)
      }

      return apiCall.success(dose)
    }

    // Get doses with optional filtering
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

/**
 * Handle PUT requests - Update a dose
 */
async function handlePut(apiCall: ApiCall) {
  const { id } = apiCall.pathParams
  const body = apiCall.body

  if (!id) {
    return apiCall.badRequest('Dose ID is required in the path')
  }

  if (!body) {
    return apiCall.badRequest('Request body is required')
  }

  try {
    // Check if dose exists
    const existingDose = await db.dose.findUnique({
      where: { id },
    })

    if (!existingDose) {
      return apiCall.notFound(`Dose with ID ${id} not found`)
    }

    // If substanceId is being updated, verify it exists
    if (body.substanceId && body.substanceId !== existingDose.substanceId) {
      const substance = await db.substance.findUnique({
        where: { id: body.substanceId },
      })

      if (!substance) {
        return apiCall.notFound(
          `Substance with ID ${body.substanceId} not found`
        )
      }
    }

    // Update the dose
    const dose = await db.dose.update({
      where: { id },
      data: {
        ...(body.amount !== undefined && { amount: body.amount }),
        ...(body.unit !== undefined && { unit: body.unit }),
        ...(body.substanceId !== undefined && {
          substanceId: body.substanceId,
        }),
      },
      include: {
        substance: true,
      },
    })

    return apiCall.success(dose)
  } catch (error) {
    logger.error('Error updating dose:', error)
    return apiCall.serverError('Failed to update dose', error as Error)
  }
}

/**
 * Handle DELETE requests - Delete a dose
 */
async function handleDelete(apiCall: ApiCall) {
  const { id } = apiCall.pathParams

  if (!id) {
    return apiCall.badRequest('Dose ID is required in the path')
  }

  try {
    // Check if dose exists
    const existingDose = await db.dose.findUnique({
      where: { id },
    })

    if (!existingDose) {
      return apiCall.notFound(`Dose with ID ${id} not found`)
    }

    // Delete the dose
    await db.dose.delete({
      where: { id },
    })

    return apiCall.noContent()
  } catch (error) {
    logger.error('Error deleting dose:', error)
    return apiCall.serverError('Failed to delete dose', error as Error)
  }
}
