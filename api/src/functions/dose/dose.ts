import type { APIGatewayEvent, Context } from 'aws-lambda'

import { ApiCall } from 'src/lib/ApiCall'
import { db } from 'src/lib/db'
import { logger } from 'src/lib/logger'

/**
 * Handler for single dose operations
 * GET /dose/:id - Get a specific dose
 * PUT /dose/:id - Update a specific dose
 * DELETE /dose/:id - Delete a specific dose
 * POST /dose - Create a new dose
 * @param event - The API Gateway event.
 * @param context - The Lambda execution context.
 * @returns A JSON response with the result of the operation.
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
      case 'PUT':
        return await handlePut(apiCall)
      case 'DELETE':
        return await handleDelete(apiCall)
      case 'POST':
        return await handleCreate(apiCall)
      default:
        return apiCall.methodNotAllowed(['GET', 'PUT', 'DELETE'])
    }
  } catch (error) {
    logger.error('Error in dose handler:', error)
    return apiCall.serverError('An unexpected error occurred', error as Error)
  }
}

/**
 * Handle GET requests - Retrieve a specific dose
 */
async function handleGet(apiCall: ApiCall) {
  const { id } = apiCall.pathParams

  if (!id) {
    return apiCall.badRequest('Dose ID is required in the path')
  }

  try {
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
  } catch (error) {
    logger.error('Error retrieving dose:', error)
    return apiCall.serverError('Failed to retrieve dose', error as Error)
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

  let parsedAmount: number | undefined
  if (body.amount !== undefined) {
    parsedAmount = parseFloat(String(body.amount))

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return apiCall.badRequest('Amount must be a positive number')
    }
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
        ...(parsedAmount !== undefined && {
          amount: parsedAmount,
        }),
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

/*
 * Handle POST requests - Create a new dose on a substance
 */
async function handleCreate(apiCall: ApiCall) {
  const body = apiCall.body

  if (!body) {
    return apiCall.badRequest('Request body is required')
  }

  const { amount, substanceName } = body

  if (amount === undefined || !substanceName) {
    return apiCall.badRequest('Amount and substanceName are required')
  } else if (
    (typeof amount !== 'number' && typeof amount !== 'string') ||
    Number(amount) <= 0
  ) {
    return apiCall.badRequest('Amount must be a positive number')
  }

  try {
    // Verify the substance exists
    const substance = await db.substance.findUnique({
      where: { name: substanceName },
    })

    if (!substance) {
      return apiCall.notFound(`Substance with name ${substanceName} not found`)
    }

    if (substance.unit == null) {
      return apiCall.badRequest(
        'Substance unit is not set. Set the substance unit before creating doses.'
      )
    }

    // Create the dose
    const dose = await db.dose.create({
      data: {
        // we need to parse this as a float, so it doesn't get rounded to an integer
        amount: parseFloat(String(amount)),
        unit: substance.unit,
        substance: {
          connect: { id: substance.id },
        },
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
