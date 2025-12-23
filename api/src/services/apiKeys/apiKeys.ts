import type { QueryResolvers, MutationResolvers } from 'types/graphql'

import { db } from 'src/lib/db'
import { hashApiKey, generateApiKey } from 'src/lib/hash'

export const apiKeys: QueryResolvers['apiKeys'] = () => {
  return db.apiKey.findMany()
}

export const apiKey: QueryResolvers['apiKey'] = ({ id }) => {
  return db.apiKey.findUnique({
    where: { id },
  })
}

export const createApiKey: MutationResolvers['createApiKey'] = async ({
  input,
}) => {
  // Generate a random API key
  const plainKey = generateApiKey()
  // Hash it for storage
  const hashedKey = await hashApiKey(plainKey)

  const apiKey = await db.apiKey.create({
    data: {
      ...input,
      hashedKey,
    },
  })

  // Return the plain key only once during creation
  return {
    ...apiKey,
    key: plainKey,
  }
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

export const deleteApiKeys: MutationResolvers['deleteApiKeys'] = ({ ids }) => {
  if (!ids.length) return 0

  return db.apiKey
    .deleteMany({
      where: { id: { in: ids } },
    })
    .then((result) => result.count)
}
