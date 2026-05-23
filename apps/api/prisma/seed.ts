import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash('Admin@1234', 12);
  const superHash = await bcrypt.hash('Super@1234', 12);
  const studentHash = await bcrypt.hash('Student@1234', 12);

  // Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'super-admin@atria.ac.in' },
    update: {},
    create: {
      email: 'super-admin@atria.ac.in',
      passwordHash: superHash,
      role: 'super_admin',
      firstName: 'Super',
      lastName: 'Admin',
      isActive: true,
      mustChangePassword: false,
    },
  });
  console.log(`Seeded super admin: ${superAdmin.email}`);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@atria.ac.in' },
    update: {},
    create: {
      email: 'admin@atria.ac.in',
      passwordHash: adminHash,
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
      mustChangePassword: false,
    },
  });
  console.log(`Seeded admin: ${admin.email}`);

  // Test Student
  const student = await prisma.user.upsert({
    where: { email: 'test-student@example.com' },
    update: {},
    create: {
      email: 'test-student@example.com',
      passwordHash: studentHash,
      role: 'student',
      firstName: 'Test',
      lastName: 'Student',
      isActive: true,
      mustChangePassword: false,
    },
  });
  console.log(`Seeded student: ${student.email}`);

  // Create student profile
  await prisma.studentProfile.upsert({
    where: { userId: student.id },
    update: {},
    create: {
      userId: student.id,
    },
  });
  console.log(`Created student profile for ${student.email}`);

  console.log('\n✅ Seed completed. Credentials:');
  console.log('  Super Admin: super-admin@atria.ac.in / Super@1234');
  console.log('  Admin:       admin@atria.ac.in / Admin@1234');
  console.log('  Student:     test-student@example.com / Student@1234');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
