import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@farmhouse.local';
  const password = 'admin123';

  // Seed Admin user
  let admin = await prisma.user.findUnique({ where: { email } });
  if (!admin) {
    const hashed = await bcrypt.hash(password, 10);
    admin = await prisma.user.create({
      data: {
        email,
        name: 'Default Admin',
        password: hashed,
        role: Role.ADMIN,
      },
    });
    console.log('Seeded admin:', email, 'password:', password);
  } else {
    console.log('Admin already exists, skipping user seed');
  }

  // Seed one example farm for that owner
  const farms = await prisma.farm.findMany({ where: { ownerId: admin.id } });
  if (farms.length === 0) {
    const farm = await prisma.farm.create({
      data: {
        name: 'Green Valley Farm',
        location: 'Near City',
        description: 'Sample seeded farm',
        ownerId: admin.id,
      },
    });
    console.log('Seeded farm:', farm.name);
  } else {
    console.log('Owner already has farms, skipping farm seed');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
