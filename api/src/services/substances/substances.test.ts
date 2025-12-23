import type { Substance } from '@prisma/client'

import {
  substances,
  substance,
  createSubstance,
  updateSubstance,
  deleteSubstance,
} from './substances.js'
import type { StandardScenario } from './substances.scenarios.js'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('substances', () => {
  scenario('returns all substances', async (scenario: StandardScenario) => {
    const result = await substances()

    expect(result.length).toEqual(Object.keys(scenario.substance).length)
  })

  scenario('returns a single substance', async (scenario: StandardScenario) => {
    const result = await substance({ id: scenario.substance.one.id })

    expect(result).toEqual(scenario.substance.one)
  })

  scenario('creates a substance', async () => {
    const result = await createSubstance({
      input: { name: 'String', unit: 'MG' },
    })

    expect(result.name).toEqual('String')
    expect(result.unit).toEqual('MG')
    expect(result.updatedAt).toBeInstanceOf(Date)
  })

  scenario('updates a substance', async (scenario: StandardScenario) => {
    const original = (await substance({
      id: scenario.substance.one.id,
    })) as Substance
    const result = await updateSubstance({
      id: original.id,
      input: { description: 'Updated description', unit: 'IU' },
    })

    expect(result.description).toEqual('Updated description')
    expect(result.unit).toEqual('IU')
  })

  scenario('deletes a substance', async (scenario: StandardScenario) => {
    const original = (await deleteSubstance({
      id: scenario.substance.one.id,
    })) as Substance
    const result = await substance({ id: original.id })

    expect(result).toEqual(null)
  })
})
