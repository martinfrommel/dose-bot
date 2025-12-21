import type {
  QueryResolvers,
  MutationResolvers,
  SubstanceRelationResolvers,
} from 'types/graphql'

import { db } from 'src/lib/db'
import { slugify } from 'src/lib/slug'

export const substances: QueryResolvers['substances'] = () => {
  return db.substance.findMany()
}

export const substance: QueryResolvers['substance'] = ({ id }) => {
  return db.substance.findUnique({
    where: { id },
  })
}

export const substanceBySlug: QueryResolvers['substanceBySlug'] = ({
  slug,
}) => {
  return db.substance.findFirst({
    where: { slug },
  })
}

export const createSubstance: MutationResolvers['createSubstance'] = ({
  input,
}) => {
  const slug = slugify(input.name)
  return db.substance.create({
    data: {
      ...input,
      slug,
    },
  })
}

export const updateSubstance: MutationResolvers['updateSubstance'] = ({
  id,
  input,
}) => {
  const updateData = input.name
    ? { ...input, slug: slugify(input.name) }
    : input
  return db.substance.update({
    data: updateData,
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

export const deleteSubstances: MutationResolvers['deleteSubstances'] = ({
  ids,
}) => {
  if (!ids.length) return 0

  return db.substance
    .deleteMany({ where: { id: { in: ids } } })
    .then((result) => result.count)
}

export const Substance: SubstanceRelationResolvers = {
  doses: (_obj, { root }) => {
    return db.substance.findUnique({ where: { id: root?.id } }).doses()
  },
}
