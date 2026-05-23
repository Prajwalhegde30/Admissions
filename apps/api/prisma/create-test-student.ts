import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestStudent() {
  const passwordHash = await bcrypt.hash('Student@1234', 12);
  
  const student = await prisma.user.upsert({
    where: { email: 'test-student@example.com' },
    update: { passwordHash },
    create: {
      email: 'test-student@example.com',
      passwordHash,
      role: 'student',
      firstName: 'Test',
      lastName: 'Student',
      isActive: true,
      mustChangePassword: false,
    },
  });

  // Create empty profile
  await prisma.studentProfile.upsert({
    where: { userId: student.id },
    update: {},
    create: {
      userId: student.id,
    },
  });

  // Create initial draft application
  await prisma.application.upsert({
    where: { studentId: student.id },
    update: {},
    create: {
      studentId: student.id,
      admissionType: 'management',
      category: 'general',
      status: 'draft',
      formData: {},
    },
  });

  console.log('Test student account created successfully!');
}

createTestStudent()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
