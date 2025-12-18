import * as bcrypt from 'bcryptjs'
import { db } from 'api/src/lib/db.js'

// Manually apply seeds via the `yarn cedar prisma db seed` command.
//
// Seeds automatically run the first time you run the `yarn cedar prisma migrate dev`
// command and every time you run the `yarn cedar prisma migrate reset` command.
//
// See https://cedarjs.com/docs/database-seeds for more info

const SALT_ROUNDS = 10

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

export default async () => {
  try {
    // Get admin email from environment variable or use default
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@dosebot.local'

    // Check if admin user already exists
    const existingAdmin = await db.user.findUnique({
      where: { email: adminEmail },
    })

    if (existingAdmin) {
      console.log(`Admin user ${adminEmail} already exists, skipping creation`)
      return
    }

    // Generate password and hash it
    const plainPassword = generatePassword()
    const salt = await bcrypt.genSalt(SALT_ROUNDS)
    const hashedPassword = await bcrypt.hash(plainPassword, salt)

    // Create admin user
    const adminUser = await db.user.create({
      data: {
        email: adminEmail,
        hashedPassword,
        salt,
      },
    })

    console.log(`Created admin user: ${adminEmail}`)
    console.log(`Admin user ID: ${adminUser.id}`)
    console.log('')

    // Send credentials via mailer stub
    sendAdminCredentialsEmail(adminEmail, plainPassword)
  } catch (error) {
    console.error(error)
  }
}
