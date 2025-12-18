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
  return db.dose.create({
    data: input,
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

export const Dose: DoseRelationResolvers = {
  substance: (_obj, { root }) => {
    return db.dose.findUnique({ where: { id: root?.id } }).substance()
  },
}
