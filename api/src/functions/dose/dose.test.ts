import { mockHttpEvent, mockContext } from '@cedarjs/testing/api'

import { db } from 'src/lib/db'

import { handler } from './dose'
import type { StandardScenario } from './dose.scenarios'

// Test API Key: bcrypt hash of "test-api-key-123"
const TEST_API_KEY_HASH =
  '$2a$10$fTcerpDX6YAE6HXZOPJy9uvEPDIPu/OkfWY2Xz1y6vgazp/0s0AuO'

async function ensureTestApiKey() {
  const existing = await db.apiKey.findFirst({
    where: { hashedKey: TEST_API_KEY_HASH },
  })

  if (!existing) {
    await db.apiKey.create({
      data: {
        name: 'Test API Key',
        enabled: true,
        hashedKey: TEST_API_KEY_HASH,
        description: 'Test API key',
      },
    })
  }
}

describe('dose API function', () => {
  beforeEach(async () => {
    await ensureTestApiKey()
  })

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
      expect(body.data.unit).toBe('MG')
        expect(body.data.substance).toBeDefined()
      }
    )

    scenario(
      'returns 400 when dose ID is missing',
      async (_scenario: StandardScenario) => {
        const httpEvent = mockHttpEvent({
          httpMethod: 'GET',
          headers: {
            Authorization: 'Bearer test-api-key-123',
          },
        })

        const response = await handler(httpEvent, mockContext())
        const body = JSON.parse(response.body)

        expect(response.statusCode).toBe(400)
        expect(body.success).toBe(false)
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
          unit: 'MG',
        }),
      })

      const response = await handler(httpEvent, mockContext())
      const body = JSON.parse(response.body)

      expect(response.statusCode).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.id).toBe(doseId)
      expect(body.data.amount).toBe(75)
      expect(body.data.unit).toBe('MG')
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
      expect(body.allowedMethods).toEqual(['GET', 'PUT', 'DELETE'])
      }
    )
  })
})
