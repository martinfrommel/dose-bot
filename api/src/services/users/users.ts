import { randomBytes } from 'crypto'

import { Role } from '@prisma/client'
import { ForbiddenError } from '@cedarjs/graphql-server'
import type { QueryResolvers, MutationResolvers } from 'types/graphql'

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

const buildAvatarUrl = () => {
  const seed = randomBytes(8).toString('hex')
  const encodedSeed = encodeURIComponent(seed)
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodedSeed}`
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

export const needsInitialAdmin: QueryResolvers['needsInitialAdmin'] =
  async () => {
    const userCount = await db.user.count()
    return userCount === 0
  }

export const createUser: MutationResolvers['createUser'] = async ({
  email,
  plainPassword,
  role = Role.User,
}) => {
  requireAuth({ roles: [Role.Admin] })

  const sanitizedEmail = sanitizeEmail(email)

  // Check if user already exists (email stored sanitized to lowercase)
  const existing = await db.user.findUnique({
    where: { email: sanitizedEmail },
  })

  if (existing) {
    throw new Error(`User with email ${email} already exists`)
  }

  // Hash password using Cedar scrypt
  const [hashedPassword, salt] = hashPassword(plainPassword)
  const avatarUrl = buildAvatarUrl()

  return db.user.create({
    data: {
      email: sanitizedEmail,
      avatarUrl,
      hashedPassword,
      salt,
      role,
    },
  })
}

export const resetUserPassword: MutationResolvers['resetUserPassword'] =
  async ({ userId }) => {
    requireAuth({ roles: [Role.Admin] })

    const currentUser = context.currentUser as
      | { id?: number; role?: Role; roles?: Role[] }
      | undefined

    if (currentUser?.id === userId) {
      throw new ForbiddenError('You cannot reset your own password')
    }

    const targetUser = await db.user.findUnique({ where: { id: userId } })
    if (!targetUser) {
      throw new Error('User not found')
    }

    const currentUserRole = currentUser?.role ?? currentUser?.roles?.[0]
    if (targetUser.role === Role.Admin && currentUserRole === Role.Admin) {
      throw new ForbiddenError(
        'Admins cannot reset passwords for other admins'
      )
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

  const currentUserId = (context.currentUser as { id?: number } | undefined)?.id
  const currentUserRole =
    (context.currentUser as { role?: Role; roles?: Role[] } | undefined)
      ?.role ||
    (context.currentUser as { roles?: Role[] } | undefined)?.roles?.[0]

  if (!currentUserId || !currentUserRole) {
    throw new Error('Unable to determine current user for authorization')
  }

  const targetUser = await db.user.findUnique({ where: { id } })

  if (!targetUser) {
    throw new Error('User not found')
  }

  if (targetUser.id === currentUserId) {
    throw new Error('You cannot delete your own account')
  }

  if (targetUser.role === Role.Admin) {
    throw new Error('Admins cannot delete other admins')
  }

  return db.user.delete({
    where: { id },
  })
}

export const createInitialAdmin: MutationResolvers['createInitialAdmin'] =
  async ({ email, plainPassword }) => {
    const sanitizedEmail = sanitizeEmail(email)

    const admin = await db.$transaction(async (tx) => {
      const userCount = await tx.user.count()
      if (userCount > 0) {
        throw new Error('Initial admin has already been created')
      }

      const existing = await tx.user.findUnique({
        where: { email: sanitizedEmail },
      })
      if (existing) {
        throw new Error(`User with email ${email} already exists`)
      }

      const [hashedPassword, salt] = hashPassword(plainPassword)
      const avatarUrl = buildAvatarUrl()

      return tx.user.create({
        data: {
          email: sanitizedEmail,
          avatarUrl,
          hashedPassword,
          salt,
          role: Role.Admin,
        },
      })
    })

    return admin
  }
