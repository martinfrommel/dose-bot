import type {
  QueryResolvers,
  MutationResolvers,
  UserRelationResolvers,
} from 'types/graphql'

import { hashPassword } from '@cedarjs/auth-dbauth-api'
import { context } from '@cedarjs/api'

import { requireAuth } from 'src/lib/auth'
import { db } from 'src/lib/db'

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
  return db.user.findMany()
}

export const user: QueryResolvers['user'] = ({ id }) => {
  return db.user.findUnique({
    where: { id },
  })
}

export const createUser: MutationResolvers['createUser'] = async ({
  email,
  plainPassword,
  role = 'User',
}) => {
  // Enforce admin-only access by checking currentUser email
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@dosebot.local'
  if (context.currentUser?.email !== adminEmail) {
    throw new Error('Only admins can create users')
  }

  // Check if user already exists
  const existing = await db.user.findUnique({
    where: { email },
  })

  if (existing) {
    throw new Error(`User with email ${email} already exists`)
  }

  // Hash password using Cedar scrypt
  const [hashedPassword, salt] = hashPassword(plainPassword)

  return db.user.create({
    data: {
      email,
      hashedPassword,
      salt,
      role,
    },
  })
}

export const resetUserPassword: MutationResolvers['resetUserPassword'] = async ({
  userId,
}) => {
  // Enforce admin-only access
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@dosebot.local'
  if (context.currentUser?.email !== adminEmail) {
    throw new Error('Only admins can reset passwords')
  }

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
  // Enforce admin-only for role changes
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@dosebot.local'
  if (role && context.currentUser?.email !== adminEmail) {
    throw new Error('Only admins can change user roles')
  }

  const data: any = {}
  if (email) data.email = email
  if (role) data.role = role

  return db.user.update({
    where: { id },
    data,
  })
}

export const deleteUser: MutationResolvers['deleteUser'] = async ({ id }) => {
  // Enforce admin-only access
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@dosebot.local'
  if (context.currentUser?.email !== adminEmail) {
    throw new Error('Only admins can delete users')
  }

  return db.user.delete({
    where: { id },
  })
}

export const User: UserRelationResolvers = {
  credentials: (_obj, { root }) => {
    return db.user.findUnique({ where: { id: root?.id } }).credentials()
  },
}
