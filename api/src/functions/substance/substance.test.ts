import { mockHttpEvent, mockContext } from '@cedarjs/testing/api'

import { db } from 'src/lib/db'

import { handler } from './substance'

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

describe('substance API function', () => {
  beforeEach(async () => {
    await ensureTestApiKey()
  })

  scenario('PUT can update unit when provided', async () => {
    const substance = await db.substance.create({
      data: {
        name: 'REST Update Unit Substance',
        slug: 'rest-update-unit-substance',
        unit: 'MG',
      },
    })

    const httpEvent = mockHttpEvent({
      httpMethod: 'PUT',
      pathParameters: { id: substance.id },
      headers: {
        Authorization: 'Bearer test-api-key-123',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        unit: 'IU',
      }),
    })

    const response = await handler(httpEvent, mockContext())
    const body = JSON.parse(response.body)

    expect(response.statusCode).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.id).toBe(substance.id)
    expect(body.data.unit).toBe('IU')

    const fromDb = await db.substance.findUnique({
      where: { id: substance.id },
    })
    expect(fromDb?.unit).toBe('IU')
  })
})
