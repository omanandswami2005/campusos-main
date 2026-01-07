import {
  PrismaClient,
  Role,
  MenuCategory,
  ClubStatus,
  EventStatus,
  ApprovalStatus,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default college
  const college = await prisma.college.upsert({
    where: { code: 'CAMPUS-A' },
    update: {},
    create: {
      code: 'CAMPUS-A',
      name: 'Campus University',
      domain: 'campus.edu',
      isActive: true,
    },
  });

  console.log('✅ Created college:', college.name);

  // Hash password
  const passwordHash = await bcrypt.hash('password123', 12);

  // Create users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'student@campus.edu' },
      update: {},
      create: {
        email: 'student@campus.edu',
        name: 'Test Student',
        passwordHash,
        role: Role.STUDENT,
        collegeId: college.id,
        emailVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'coordinator@campus.edu' },
      update: {},
      create: {
        email: 'coordinator@campus.edu',
        name: 'Club Coordinator',
        passwordHash,
        role: Role.COORDINATOR,
        collegeId: college.id,
        emailVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'staff@campus.edu' },
      update: {},
      create: {
        email: 'staff@campus.edu',
        name: 'Staff Member',
        passwordHash,
        role: Role.STAFF,
        collegeId: college.id,
        emailVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'admin@campus.edu' },
      update: {},
      create: {
        email: 'admin@campus.edu',
        name: 'Admin User',
        passwordHash,
        role: Role.ADMIN,
        collegeId: college.id,
        emailVerified: true,
      },
    }),
  ]);

  console.log('✅ Created users:', users.map((u) => u.email).join(', '));

  const [student, coordinator, staff, admin] = users;

  // Create clubs
  const techClub = await prisma.club.upsert({
    where: { id: 'tech-club-1' },
    update: {},
    create: {
      id: 'tech-club-1',
      name: 'Tech Innovators Club',
      description: 'A community for tech enthusiasts to learn, build, and innovate.',
      category: 'technology',
      status: ClubStatus.APPROVED,
      memberCount: 150,
      collegeId: college.id,
      coordinatorId: coordinator.id,
      approvedById: admin.id,
      approvedAt: new Date(),
      email: 'tech@campus.edu',
    },
  });

  console.log('✅ Created club:', techClub.name);

  // Create events
  const hackathon = await prisma.event.upsert({
    where: { id: 'event-hackathon-1' },
    update: {},
    create: {
      id: 'event-hackathon-1',
      title: 'Campus Hackathon 2026',
      description: '24-hour coding challenge with exciting prizes.',
      startDate: new Date('2026-02-15T09:00:00Z'),
      endDate: new Date('2026-02-16T09:00:00Z'),
      location: 'Tech Building, Lab 101',
      venue: 'Tech Building',
      category: 'technology',
      capacity: 100,
      registeredCount: 45,
      isPublic: true,
      registrationDeadline: new Date('2026-02-10T23:59:59Z'),
      status: EventStatus.PUBLISHED,
      approvalStatus: ApprovalStatus.APPROVED,
      collegeId: college.id,
      clubId: techClub.id,
      organizerId: coordinator.id,
      approvedById: admin.id,
      approvedAt: new Date(),
      tags: ['hackathon', 'coding', 'prizes'],
      rules: ['Teams of 2-4', 'Bring your laptop'],
    },
  });

  console.log('✅ Created event:', hackathon.title);

  // Create menu items
  const menuItems = await Promise.all([
    prisma.menuItem.upsert({
      where: { id: 'menu-coffee' },
      update: {},
      create: {
        id: 'menu-coffee',
        name: 'Coffee',
        description: 'Hot brewed coffee',
        priceCents: 250,
        category: MenuCategory.BEVERAGES,
        available: true,
        collegeId: college.id,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'menu-samosa' },
      update: {},
      create: {
        id: 'menu-samosa',
        name: 'Samosa',
        description: 'Crispy potato samosa',
        priceCents: 150,
        category: MenuCategory.SNACKS,
        available: true,
        collegeId: college.id,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'menu-sandwich' },
      update: {},
      create: {
        id: 'menu-sandwich',
        name: 'Veg Sandwich',
        description: 'Toasted sandwich with veggies',
        priceCents: 300,
        category: MenuCategory.SNACKS,
        available: true,
        collegeId: college.id,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'menu-biryani' },
      update: {},
      create: {
        id: 'menu-biryani',
        name: 'Chicken Biryani',
        description: 'Aromatic rice with chicken',
        priceCents: 1500,
        category: MenuCategory.MEALS,
        available: true,
        collegeId: college.id,
      },
    }),
  ]);

  console.log('✅ Created menu items:', menuItems.length);

  // Create promotional offer
  await prisma.promotionalOffer.upsert({
    where: { code: 'SAVE10' },
    update: {},
    create: {
      code: 'SAVE10',
      description: '10% off on orders above ₹100',
      discountType: 'percentage',
      value: 10,
      minOrderCents: 10000,
      validFrom: new Date(),
      validUntil: new Date('2026-12-31'),
      isActive: true,
    },
  });

  console.log('✅ Created promotional offers');

  // Create print shop
  const printShop = await prisma.printShop.upsert({
    where: { id: 'print-shop-1' },
    update: {},
    create: {
      id: 'print-shop-1',
      name: 'Library Print Center',
      location: 'Main Library, Ground Floor',
      collegeId: college.id,
      isOpen: true,
      pricePerPageCents: 200,
      colorPricePerPageCents: 500,
      openTime: '09:00',
      closeTime: '18:00',
    },
  });

  console.log('✅ Created print shop:', printShop.name);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
