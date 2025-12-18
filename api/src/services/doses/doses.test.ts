import type { Dose } from '@prisma/client'

import { doses, dose, createDose, updateDose, deleteDose } from './doses.js'
import type { StandardScenario } from './doses.scenarios.js'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('doses', () => {
  scenario('returns all doses', async (scenario: StandardScenario) => {
    const result = await doses()

    expect(result.length).toEqual(Object.keys(scenario.dose).length)
  })

  scenario('returns a single dose', async (scenario: StandardScenario) => {
    const result = await dose({ id: scenario.dose.one.id })

    expect(result).toEqual(scenario.dose.one)
  })

  scenario('creates a dose', async (scenario: StandardScenario) => {
    const result = await createDose({
      input: {
        updatedAt: '2025-12-18T02:47:35.586Z',
        amount: 5091089.867864489,
        substanceId: scenario.dose.two.substanceId,
      },
    })

    expect(result.updatedAt).toEqual(new Date('2025-12-18T02:47:35.586Z'))
    expect(result.amount).toEqual(5091089.867864489)
    expect(result.substanceId).toEqual(scenario.dose.two.substanceId)
  })

  scenario('updates a dose', async (scenario: StandardScenario) => {
    const original = (await dose({ id: scenario.dose.one.id })) as Dose
    const result = await updateDose({
      id: original.id,
      input: { updatedAt: '2025-12-19T02:47:35.590Z' },
    })

    expect(result.updatedAt).toEqual(new Date('2025-12-19T02:47:35.590Z'))
  })

  scenario('deletes a dose', async (scenario: StandardScenario) => {
    const original = (await deleteDose({ id: scenario.dose.one.id })) as Dose
    const result = await dose({ id: original.id })

    expect(result).toEqual(null)
  })
})
