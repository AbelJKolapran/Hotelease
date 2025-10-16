import dotenv from 'dotenv'
// Load env regardless of CWD
dotenv.config({ path: process.cwd().includes('apps\\backend') || process.cwd().includes('apps/backend') ? '.env' : 'apps/backend/.env' })

import { PrismaClient, Role, BookingStatus, RoomStatus } from '@prisma/client'
import argon2 from 'argon2'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const email = 'admin@example.com'
  const passwordPlain = 'Password123'
  const fullName = 'Admin User'
  const hotelName = 'Demo Hotel'

  const existingUser = await prisma.user.findUnique({ where: { email } })
  let userId: string
  if (existingUser) {
    userId = existingUser.id
  } else {
    const password = await argon2.hash(passwordPlain)
    const user = await prisma.user.create({ data: { email, password, fullName } })
    userId = user.id
  }

  const hotel = await prisma.hotel.upsert({
    where: { id: (await prisma.hotel.findFirst({ where: { name: hotelName } }))?.id || 'noop' },
    update: {},
    create: { name: hotelName },
  })

  // Ensure membership
  await prisma.userHotel.upsert({
    where: { userId_hotelId: { userId, hotelId: hotel.id } },
    update: { role: Role.OWNER },
    create: { userId, hotelId: hotel.id, role: Role.OWNER },
  })

  // Rooms
  const room101 = await prisma.room.upsert({
    where: { hotelId_number: { hotelId: hotel.id, number: '101' } },
    update: { rateCents: 12000, type: 'Deluxe', status: RoomStatus.AVAILABLE },
    create: { hotelId: hotel.id, number: '101', type: 'Deluxe', rateCents: 12000 },
  })
  const room102 = await prisma.room.upsert({
    where: { hotelId_number: { hotelId: hotel.id, number: '102' } },
    update: { rateCents: 9000, type: 'Standard', status: RoomStatus.AVAILABLE },
    create: { hotelId: hotel.id, number: '102', type: 'Standard', rateCents: 9000 },
  })

  // Customers
  const customer = await prisma.customer.upsert({
    where: { id: (await prisma.customer.findFirst({ where: { hotelId: hotel.id, email: 'guest@example.com' } }))?.id || 'noop' },
    update: { firstName: 'Guest', lastName: 'User' },
    create: { hotelId: hotel.id, firstName: 'Guest', lastName: 'User', email: 'guest@example.com' },
  })

  // Booking
  const today = new Date()
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
  await prisma.booking.create({
    data: {
      hotelId: hotel.id,
      roomId: room101.id,
      customerId: customer.id,
      checkInDate: today,
      checkOutDate: tomorrow,
      totalCents: 12000,
      status: BookingStatus.CONFIRMED,
    },
  }).catch(() => {})

  console.log('Seeding complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


