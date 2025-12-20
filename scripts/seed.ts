import { db } from 'api/src/lib/db.js'

import { hashPassword } from '@cedarjs/auth-dbauth-api'

// Manually apply seeds via the `yarn cedar prisma db seed` command.
//
// Seeds automatically run the first time you run the `yarn cedar prisma migrate dev`
// command and every time you run the `yarn cedar prisma migrate reset` command.
//
// See https://cedarjs.com/docs/database-seeds for more info

// Use Cedar's dbAuth hashing (scrypt) instead of bcrypt

const isDemoMode = () =>
  process.env.DEMO_MODE === '1' || process.env.REDWOOD_ENV_DEMO_MODE === '1'

/**
 * Sanitize email to lowercase
 */
const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim()
}

/**
 * Generate a random password for the admin user
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

/**
 * Send admin credentials via mailer (stub for now)
 * TODO: Implement actual email sending via SMTP when configured
 */
const sendAdminCredentialsEmail = (email: string, password: string) => {
  console.log('------- EMAIL STUB -------')
  console.log(`To: ${email}`)
  console.log('Subject: Your DoseBot Admin Account Credentials')
  console.log('')
  console.log('Email body:')
  console.log(`Your DoseBot admin account has been created.`)
  console.log(`Email: ${email}`)
  console.log(`Password: ${password}`)
  console.log('')
  console.log('Please log in and change your password immediately.')
  console.log('------- END EMAIL -------')
}

const ensureDemoUser = async () => {
  if (!isDemoMode()) return

  const demoEmail = sanitizeEmail('demo@dosebot.local')
  const [hashedPassword, salt] = hashPassword('demo')

  const existingDemo = await db.user.findUnique({
    where: { email: demoEmail },
  })

  if (existingDemo) {
    await db.user.update({
      where: { id: existingDemo.id },
      data: {
        hashedPassword,
        salt,
        role: 'User',
      },
    })

    console.log(`Updated demo user credentials: ${demoEmail}`)
    return
  }

  await db.user.create({
    data: {
      email: demoEmail,
      hashedPassword,
      salt,
      role: 'User',
    },
  })

  console.log(`Created demo user: ${demoEmail}`)
}

export default async () => {
  try {
    // Get admin email from environment variable or use default
    const adminEmailRaw = process.env.ADMIN_EMAIL || 'admin@dosebot.local'
    const adminEmail = sanitizeEmail(adminEmailRaw)

    // Check if admin user already exists (emails stored sanitized)
    const existingAdmin = await db.user.findUnique({
      where: { email: adminEmail },
    })

    // Generate a new password and Cedar-compatible hash/salt
    const plainPassword = generatePassword()
    const [hashedPassword, salt] = hashPassword(plainPassword)

    if (existingAdmin) {
      const updated = await db.user.update({
        where: { id: existingAdmin.id },
        data: {
          hashedPassword,
          salt,
          role: 'Admin',
        },
      })

      console.log(`Updated admin user credentials: ${adminEmail}`)
      console.log(`Admin user ID: ${updated.id}`)
      console.log('')

      sendAdminCredentialsEmail(adminEmail, plainPassword)
      await ensureDemoUser()
      return
    }

    // Create admin user (Cedar scrypt hashed password)
    const created = await db.user.create({
      data: {
        email: adminEmail,
        hashedPassword,
        salt,
        role: 'Admin',
      },
    })

    console.log(`Created admin user: ${adminEmail}`)
    console.log(`Admin user ID: ${created.id}`)
    console.log('')

    sendAdminCredentialsEmail(adminEmail, plainPassword)

    await ensureDemoUser()
  } catch (error) {
    console.error(error)
  }
}
