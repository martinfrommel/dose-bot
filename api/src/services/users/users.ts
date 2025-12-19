import { Role } from '@prisma/client'
import type {
  QueryResolvers,
  MutationResolvers,
  UserRelationResolvers,
} from 'types/graphql'

import { hashPassword } from '@cedarjs/auth-dbauth-api'

import { requireAuth } from 'src/lib/auth'
import { db } from 'src/lib/db'
import { sanitizeEmail } from 'src/lib/sanitizeEmail'

/**
 * Generate a random password for new users
 */
const generatePassword = (): string => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()'
  let password = ''
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export const users: QueryResolvers['users'] = () => {
  requireAuth({ roles: [Role.Admin] })
  return db.user.findMany()
}

export const user: QueryResolvers['user'] = ({ id }) => {
  requireAuth({ roles: [Role.Admin] })
  return db.user.findUnique({
    where: { id },
  })
}

export const createUser: MutationResolvers['createUser'] = async ({
  email,
  plainPassword,
  role = Role.User,
}) => {
  requireAuth({ roles: [Role.Admin] })

  const sanitizedEmail = sanitizeEmail(email)

  // Check if user already exists (case-insensitive)
  const existing = await db.user.findUnique({
    where: {
      email: {
        equals: sanitizedEmail,
        mode: 'insensitive',
      } as any,
    },
  })

  if (existing) {
    throw new Error(`User with email ${email} already exists`)
  }

  // Hash password using Cedar scrypt
  const [hashedPassword, salt] = hashPassword(plainPassword)

  return db.user.create({
    data: {
      email: sanitizedEmail,
      hashedPassword,
      salt,
      role,
    },
  })
}

export const resetUserPassword: MutationResolvers['resetUserPassword'] =
  async ({ userId }) => {
    requireAuth({ roles: [Role.Admin] })

    // Generate temp password
    const tempPassword = generatePassword()
    const [hashedPassword, salt] = hashPassword(tempPassword)

    await db.user.update({
      where: { id: userId },
      data: { hashedPassword, salt },
    })

    return tempPassword
  }

export const updateUser: MutationResolvers['updateUser'] = async ({
  id,
  email,
  role,
}) => {
  requireAuth({ roles: [Role.Admin] })

  const data: any = {}
  if (email) data.email = sanitizeEmail(email)
  if (role) data.role = role

  return db.user.update({
    where: { id },
    data,
  })
}

export const deleteUser: MutationResolvers['deleteUser'] = async ({ id }) => {
  requireAuth({ roles: [Role.Admin] })

  return db.user.delete({
    where: { id },
  })
}

export const User: UserRelationResolvers = {
  credentials: (_obj, { root }) => {
    return db.user.findUnique({ where: { id: root?.id } }).credentials()
  },
}
