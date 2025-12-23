import type { Prisma } from '@prisma/client'
import type {
  QueryResolvers,
  MutationResolvers,
  DoseRelationResolvers,
} from 'types/graphql'

import { db } from 'src/lib/db'

export const doses: QueryResolvers['doses'] = () => {
  return db.dose.findMany()
}

export const dose: QueryResolvers['dose'] = ({ id }) => {
  return db.dose.findUnique({
    where: { id },
  })
}

export const createDose: MutationResolvers['createDose'] = ({ input }) => {
  const { substanceId, ...rest } = input

  return db.substance
    .findUnique({ where: { id: substanceId }, select: { unit: true } })
    .then((substance) => {
      if (!substance) {
        throw new Error('Substance not found')
      }

      if (substance.unit == null) {
        throw new Error(
          'Substance unit is not set. Set the substance unit before creating doses.'
        )
      }

      return db.dose.create({
        data: {
          ...rest,
          unit: substance.unit,
          substance: { connect: { id: substanceId } },
        },
      })
    })
}

export const updateDose: MutationResolvers['updateDose'] = ({ id, input }) => {
  // Unit is canonical on Substance; any provided unit updates are ignored.
  // Keep unit optional in SDL to support legacy clients that still send it.
  const { amount, substanceId } = input

  const updateData: Prisma.DoseUpdateInput = {
    ...(amount == null ? {} : { amount }),
    ...(substanceId ? { substance: { connect: { id: substanceId } } } : {}),
  }

  return db.dose.update({
    data: updateData,
    where: { id },
  })
}

export const deleteDose: MutationResolvers['deleteDose'] = ({ id }) => {
  return db.dose.delete({
    where: { id },
  })
}

export const deleteDoses: MutationResolvers['deleteDoses'] = ({ ids }) => {
  if (!ids.length) return 0

  return db.dose
    .deleteMany({ where: { id: { in: ids } } })
    .then((result) => result.count)
}

export const Dose: DoseRelationResolvers = {
  substance: (_obj, { root }) => {
    return db.dose.findUnique({ where: { id: root?.id } }).substance()
  },
}
