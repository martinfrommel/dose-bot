import { mockHttpEvent, mockContext } from '@cedarjs/testing/api'

import { db } from 'src/lib/db'

import { handler } from './substances'

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

describe('substances API function', () => {
  beforeEach(async () => {
    await ensureTestApiKey()
  })

  scenario('POST requires unit', async () => {
    const httpEvent = mockHttpEvent({
      httpMethod: 'POST',
      headers: {
        Authorization: 'Bearer test-api-key-123',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Missing Unit Substance',
      }),
    })

    const response = await handler(httpEvent, mockContext())
    const body = JSON.parse(response.body)

    expect(response.statusCode).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error).toContain('name and unit')
  })

  scenario('POST creates substance with unit', async () => {
    const httpEvent = mockHttpEvent({
      httpMethod: 'POST',
      headers: {
        Authorization: 'Bearer test-api-key-123',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'REST Create Substance',
        unit: 'MG',
      }),
    })

    const response = await handler(httpEvent, mockContext())
    const body = JSON.parse(response.body)

    expect(response.statusCode).toBe(201)
    expect(body.success).toBe(true)
    expect(body.data.name).toBe('REST Create Substance')
    expect(body.data.unit).toBe('MG')

    const fromDb = await db.substance.findUnique({
      where: { id: body.data.id },
    })
    expect(fromDb?.unit).toBe('MG')
  })
})
