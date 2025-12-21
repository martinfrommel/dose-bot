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
  return db.dose.create({
    data: { ...rest, substance: { connect: { id: substanceId } } },
  })
}

export const updateDose: MutationResolvers['updateDose'] = ({ id, input }) => {
  return db.dose.update({
    data: input,
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
