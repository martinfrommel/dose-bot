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
        unit: 'G',
        amount: 5091089.867864489,
        substanceId: scenario.dose.two.substanceId,
      },
    })

    // updatedAt is managed by Prisma (@updatedAt), so just assert it was set
    expect(result.updatedAt).toBeInstanceOf(Date)
    expect(result.amount).toEqual(5091089.867864489)
    expect(result.unit).toEqual('G')
    expect(result.substanceId).toEqual(scenario.dose.two.substanceId)
  })

  scenario('updates a dose', async (scenario: StandardScenario) => {
    const original = (await dose({ id: scenario.dose.one.id })) as Dose
    const result = await updateDose({
      id: original.id,
      input: { unit: 'G' },
    })

    expect(result.unit).toEqual('G')
  })

  scenario('deletes a dose', async (scenario: StandardScenario) => {
    const original = (await deleteDose({ id: scenario.dose.one.id })) as Dose
    const result = await dose({ id: original.id })

    expect(result).toEqual(null)
  })
})
