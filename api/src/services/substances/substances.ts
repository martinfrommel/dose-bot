import type {
  QueryResolvers,
  MutationResolvers,
  SubstanceRelationResolvers,
} from 'types/graphql'

import { db } from 'src/lib/db'

export const substances: QueryResolvers['substances'] = () => {
  return db.substance.findMany()
}

export const substance: QueryResolvers['substance'] = ({ id }) => {
  return db.substance.findUnique({
    where: { id },
  })
}

export const createSubstance: MutationResolvers['createSubstance'] = ({
  input,
}) => {
  return db.substance.create({
    data: input,
  })
}

export const updateSubstance: MutationResolvers['updateSubstance'] = ({
  id,
  input,
}) => {
  return db.substance.update({
    data: input,
    where: { id },
  })
}

export const deleteSubstance: MutationResolvers['deleteSubstance'] = ({
  id,
}) => {
  return db.substance.delete({
    where: { id },
  })
}

export const Substance: SubstanceRelationResolvers = {
  doses: (_obj, { root }) => {
    return db.substance.findUnique({ where: { id: root?.id } }).doses()
  },
}
