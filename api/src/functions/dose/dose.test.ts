import { mockHttpEvent, mockContext } from '@cedarjs/testing/api'

import { db } from 'src/lib/db'

import { handler } from './dose'
import type { StandardScenario } from './dose.scenarios'

// Test API Key: bcrypt hash of "test-api-key-123"
const TEST_API_KEY_HASH =
  '$2a$10$fTcerpDX6YAE6HXZOPJy9uvEPDIPu/OkfWY2Xz1y6vgazp/0s0AuO'

// Setup function to create necessary test fixtures
async function setupTestFixtures() {
  // Create API key
  const apiKey = await db.apiKey.create({
    data: {
      name: 'Test API Key',
      enabled: true,
      hashedKey: TEST_API_KEY_HASH,
      description: 'Test API key',
    },
  })

  // Create test substance
  const substance = await db.substance.create({
    data: {
      name: 'Caffeine',
      slug: 'caffeine-api-test',
      description: 'Test substance',
    },
  })

  return { apiKey, substance }
}

describe('dose API function', () => {
  // Authentication Tests
  describe('authentication', () => {
    scenario('rejects request without API key', async () => {
      const httpEvent = mockHttpEvent({
        httpMethod: 'GET',
      })

      const response = await handler(httpEvent, mockContext())
      const body = JSON.parse(response.body)

      expect(response.statusCode).toBe(401)
      expect(body.success).toBe(false)
      expect(body.error).toContain('Invalid or missing API key')
    })

    scenario(
      'rejects request with invalid API key',
      async (_scenario: StandardScenario) => {
        const httpEvent = mockHttpEvent({
          httpMethod: 'GET',
          headers: {
            Authorization: 'Bearer invalid-key',
          },
        })

        const response = await handler(httpEvent, mockContext())
        const body = JSON.parse(response.body)

        expect(response.statusCode).toBe(401)
        expect(body.success).toBe(false)
      }
    )

    scenario(
      'rejects request with disabled API key',
      async (_scenario: StandardScenario) => {
        const httpEvent = mockHttpEvent({
          httpMethod: 'GET',
          headers: {
            Authorization: 'test-api-key-disabled',
          },
        })

        const response = await handler(httpEvent, mockContext())
        const body = JSON.parse(response.body)

        expect(response.statusCode).toBe(401)
        expect(body.success).toBe(false)
      }
    )
  })

  // GET Request Tests
  describe('GET requests', () => {
    scenario('returns all doses', async (_scenario: StandardScenario) => {
      const httpEvent = mockHttpEvent({
        httpMethod: 'GET',
        headers: {
          Authorization: 'Bearer test-api-key-123',
        },
      })

      const response = await handler(httpEvent, mockContext())
      const body = JSON.parse(response.body)

      expect(response.statusCode).toBe(200)
      expect(body.success).toBe(true)
      expect(Array.isArray(body.data)).toBe(true)
      expect(body.data.length).toBeGreaterThanOrEqual(2)
    })

    scenario(
      'returns a specific dose by ID',
      async (scenario: StandardScenario) => {
        const doseId = scenario.dose.caffeineLight.id

        const httpEvent = mockHttpEvent({
          httpMethod: 'GET',
          pathParameters: { id: doseId },
          headers: {
            Authorization: 'Bearer test-api-key-123',
          },
        })

        const response = await handler(httpEvent, mockContext())
        const body = JSON.parse(response.body)

        expect(response.statusCode).toBe(200)
        expect(body.success).toBe(true)
        expect(body.data.id).toBe(doseId)
        expect(body.data.amount).toBe(50)
        expect(body.data.unit).toBe('mg')
        expect(body.data.substance).toBeDefined()
      }
    )

    scenario(
      'returns 404 for non-existent dose ID',
      async (_scenario: StandardScenario) => {
        const httpEvent = mockHttpEvent({
          httpMethod: 'GET',
          pathParameters: { id: 'non-existent-id' },
          headers: {
            Authorization: 'Bearer test-api-key-123',
          },
        })

        const response = await handler(httpEvent, mockContext())
        const body = JSON.parse(response.body)

        expect(response.statusCode).toBe(404)
        expect(body.success).toBe(false)
        expect(body.error).toContain('not found')
      }
    )

    scenario(
      'filters doses by substanceId',
      async (scenario: StandardScenario) => {
        const substanceId = scenario.dose.caffeineLight.substanceId

        const httpEvent = mockHttpEvent({
          httpMethod: 'GET',
          queryStringParameters: { substanceId },
          headers: {
            Authorization: 'Bearer test-api-key-123',
          },
        })

        const response = await handler(httpEvent, mockContext())
        const body = JSON.parse(response.body)

        expect(response.statusCode).toBe(200)
        expect(body.success).toBe(true)
        expect(Array.isArray(body.data)).toBe(true)
        body.data.forEach((dose) => {
          expect(dose.substanceId).toBe(substanceId)
        })
      }
    )

    scenario(
      'filters doses by substance slug',
      async (_scenario: StandardScenario) => {
        const { substance } = await setupTestFixtures()

        const httpEvent = mockHttpEvent({
          httpMethod: 'GET',
          queryStringParameters: { slug: substance.slug },
          headers: {
            Authorization: 'Bearer test-api-key-123',
          },
        })

        const response = await handler(httpEvent, mockContext())
        const body = JSON.parse(response.body)

        expect(response.statusCode).toBe(200)
        expect(body.success).toBe(true)
        expect(Array.isArray(body.data)).toBe(true)
      }
    )

    scenario(
      'returns 404 for non-existent substance slug',
      async (_scenario: StandardScenario) => {
        const httpEvent = mockHttpEvent({
          httpMethod: 'GET',
          queryStringParameters: { slug: 'non-existent-slug' },
          headers: {
            Authorization: 'Bearer test-api-key-123',
          },
        })

        const response = await handler(httpEvent, mockContext())
        const body = JSON.parse(response.body)

        expect(response.statusCode).toBe(404)
        expect(body.success).toBe(false)
        expect(body.error).toContain('not found')
      }
    )
  })

  // POST Request Tests
  describe('POST requests', () => {
    scenario('creates a new dose', async (_scenario: StandardScenario) => {
      const { substance } = await setupTestFixtures()

      const httpEvent = mockHttpEvent({
        httpMethod: 'POST',
        headers: {
          Authorization: 'Bearer test-api-key-123',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 200,
          unit: 'MG',
          substanceId: substance.id,
        }),
      })

      const response = await handler(httpEvent, mockContext())
      const body = JSON.parse(response.body)

      expect(response.statusCode).toBe(201)
      expect(body.success).toBe(true)
      expect(body.data.amount).toBe(200)
      expect(body.data.unit).toBe('MG')
      expect(body.data.substanceId).toBe(substance.id)
      expect(body.data.id).toBeDefined()
    })

    scenario(
      'returns 400 when missing required fields',
      async (_scenario: StandardScenario) => {
        const httpEvent = mockHttpEvent({
          httpMethod: 'POST',
          headers: {
            Authorization: 'Bearer test-api-key-123',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: 200,
            // Missing unit and substanceId
          }),
        })

        const response = await handler(httpEvent, mockContext())
        const body = JSON.parse(response.body)

        expect(response.statusCode).toBe(400)
        expect(body.success).toBe(false)
        expect(body.error).toContain('required')
      }
    )

    scenario(
      'returns 404 when substance does not exist',
      async (_scenario: StandardScenario) => {
        const httpEvent = mockHttpEvent({
          httpMethod: 'POST',
          headers: {
            Authorization: 'Bearer test-api-key-123',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: 200,
            unit: 'mg',
            substanceId: 'non-existent-substance-id',
          }),
        })

        const response = await handler(httpEvent, mockContext())
        const body = JSON.parse(response.body)

        expect(response.statusCode).toBe(404)
        expect(body.success).toBe(false)
        expect(body.error).toContain('not found')
      }
    )
  })

  // PUT Request Tests
  describe('PUT requests', () => {
    scenario('updates an existing dose', async (scenario: StandardScenario) => {
      const doseId = scenario.dose.caffeineLight.id

      const httpEvent = mockHttpEvent({
        httpMethod: 'PUT',
        pathParameters: { id: doseId },
        headers: {
          Authorization: 'Bearer test-api-key-123',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 75,
          unit: 'mg',
        }),
      })

      const response = await handler(httpEvent, mockContext())
      const body = JSON.parse(response.body)

      expect(response.statusCode).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.id).toBe(doseId)
      expect(body.data.amount).toBe(75)
      expect(body.data.unit).toBe('mg')
    })

    scenario(
      'returns 400 when dose ID is missing',
      async (_scenario: StandardScenario) => {
        const httpEvent = mockHttpEvent({
          httpMethod: 'PUT',
          headers: {
            Authorization: 'Bearer test-api-key-123',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: 75,
          }),
        })

        const response = await handler(httpEvent, mockContext())
        const body = JSON.parse(response.body)

        expect(response.statusCode).toBe(400)
        expect(body.success).toBe(false)
        expect(body.error).toContain('required')
      }
    )

    scenario(
      'returns 404 when dose does not exist',
      async (_scenario: StandardScenario) => {
        const httpEvent = mockHttpEvent({
          httpMethod: 'PUT',
          pathParameters: { id: 'non-existent-id' },
          headers: {
            Authorization: 'Bearer test-api-key-123',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: 75,
          }),
        })

        const response = await handler(httpEvent, mockContext())
        const body = JSON.parse(response.body)

        expect(response.statusCode).toBe(404)
        expect(body.success).toBe(false)
        expect(body.error).toContain('not found')
      }
    )

    scenario(
      'validates new substanceId when updating',
      async (scenario: StandardScenario) => {
        const doseId = scenario.dose.caffeineLight.id

        const httpEvent = mockHttpEvent({
          httpMethod: 'PUT',
          pathParameters: { id: doseId },
          headers: {
            Authorization: 'Bearer test-api-key-123',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            substanceId: 'non-existent-substance-id',
          }),
        })

        const response = await handler(httpEvent, mockContext())
        const body = JSON.parse(response.body)

        expect(response.statusCode).toBe(404)
        expect(body.success).toBe(false)
        expect(body.error).toContain('not found')
      }
    )
  })

  // DELETE Request Tests
  describe('DELETE requests', () => {
    scenario('deletes an existing dose', async (scenario: StandardScenario) => {
      const doseId = scenario.dose.caffeineLight.id

      const httpEvent = mockHttpEvent({
        httpMethod: 'DELETE',
        pathParameters: { id: doseId },
        headers: {
          Authorization: 'Bearer test-api-key-123',
        },
      })

      const response = await handler(httpEvent, mockContext())

      expect(response.statusCode).toBe(204)
      expect(response.body).toBe('')
    })

    scenario(
      'returns 400 when dose ID is missing',
      async (_scenario: StandardScenario) => {
        const httpEvent = mockHttpEvent({
          httpMethod: 'DELETE',
          headers: {
            Authorization: 'Bearer test-api-key-123',
          },
        })

        const response = await handler(httpEvent, mockContext())
        const body = JSON.parse(response.body)

        expect(response.statusCode).toBe(400)
        expect(body.success).toBe(false)
        expect(body.error).toContain('required')
      }
    )

    scenario(
      'returns 404 when dose does not exist',
      async (_scenario: StandardScenario) => {
        const httpEvent = mockHttpEvent({
          httpMethod: 'DELETE',
          pathParameters: { id: 'non-existent-id' },
          headers: {
            Authorization: 'Bearer test-api-key-123',
          },
        })

        const response = await handler(httpEvent, mockContext())
        const body = JSON.parse(response.body)

        expect(response.statusCode).toBe(404)
        expect(body.success).toBe(false)
        expect(body.error).toContain('not found')
      }
    )
  })

  // Method Not Allowed Tests
  describe('unsupported methods', () => {
    scenario(
      'returns 405 for PATCH method',
      async (_scenario: StandardScenario) => {
        const httpEvent = mockHttpEvent({
          httpMethod: 'PATCH',
          headers: {
            Authorization: 'Bearer test-api-key-123',
          },
        })

        const response = await handler(httpEvent, mockContext())
        const body = JSON.parse(response.body)

        expect(response.statusCode).toBe(405)
        expect(body.success).toBe(false)
        expect(body.error).toContain('not allowed')
        expect(body.allowedMethods).toEqual(['GET', 'POST', 'PUT', 'DELETE'])
      }
    )
  })
})
