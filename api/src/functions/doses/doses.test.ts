import { mockHttpEvent, mockContext } from '@cedarjs/testing/api'

import { db } from 'src/lib/db'

import { handler } from './doses'

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

describe('doses API function', () => {
  beforeEach(async () => {
    await ensureTestApiKey()
  })

  scenario('POST creates dose and derives unit from substance', async () => {
    const substance = await db.substance.create({
      data: {
        name: 'REST Derive Unit Substance',
        slug: 'rest-derive-unit-substance',
        unit: 'MG',
      },
    })

    const httpEvent = mockHttpEvent({
      httpMethod: 'POST',
      headers: {
        Authorization: 'Bearer test-api-key-123',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 12.5,
        substanceId: substance.id,
        // even if a legacy client sends unit, it must be ignored
        unit: 'G',
      }),
    })

    const response = await handler(httpEvent, mockContext())
    const body = JSON.parse(response.body)

    expect(response.statusCode).toBe(201)
    expect(body.success).toBe(true)
    expect(body.data.amount).toBe(12.5)
    expect(body.data.unit).toBe('MG')
    expect(body.data.substanceId).toBe(substance.id)
    expect(body.data.substance).toBeDefined()
    expect(body.data.substance.unit).toBe('MG')
  })

  scenario('POST rejects when substance unit is null', async () => {
    const substance = await db.substance.create({
      data: {
        name: 'REST Null Unit Substance',
        slug: 'rest-null-unit-substance',
        unit: null,
      },
    })

    const httpEvent = mockHttpEvent({
      httpMethod: 'POST',
      headers: {
        Authorization: 'Bearer test-api-key-123',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 1,
        substanceId: substance.id,
      }),
    })

    const response = await handler(httpEvent, mockContext())
    const body = JSON.parse(response.body)

    expect(response.statusCode).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error).toContain('Substance unit is not set')
  })
})
