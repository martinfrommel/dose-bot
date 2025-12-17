import type { QueryResolvers, MutationResolvers } from 'types/graphql'

import { db } from 'src/lib/db'

export const apiKeys: QueryResolvers['apiKeys'] = () => {
  return db.apiKey.findMany()
}

export const apiKey: QueryResolvers['apiKey'] = ({ id }) => {
  return db.apiKey.findUnique({
    where: { id },
  })
}

export const createApiKey: MutationResolvers['createApiKey'] = ({ input }) => {
  return db.apiKey.create({
    data: input,
  })
}

export const updateApiKey: MutationResolvers['updateApiKey'] = ({
  id,
  input,
}) => {
  return db.apiKey.update({
    data: input,
    where: { id },
  })
}

export const deleteApiKey: MutationResolvers['deleteApiKey'] = ({ id }) => {
  return db.apiKey.delete({
    where: { id },
  })
}
