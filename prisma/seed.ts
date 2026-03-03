import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'owner@farmhouse.local';
  const password = 'owner123';

  // Seed Owner user
  let owner = await prisma.user.findUnique({ where: { email } });
  if (!owner) {
    const hashed = await bcrypt.hash(password, 10);
    owner = await prisma.user.create({
      data: {
        email,
        name: 'Default Owner',
        password: hashed,
        role: Role.OWNER
      }
    });
    console.log('Seeded owner:', email, 'password:', password);
  } else {
    console.log('Owner already exists, skipping user seed');
  }

  // Seed one example farm for that owner
  const farms = await prisma.farm.findMany({ where: { ownerId: owner.id } });
  if (farms.length === 0) {
    const farm = await prisma.farm.create({
      data: {
        name: 'Green Valley Farm',
        location: 'Near City',
        description: 'Sample seeded farm',
        ownerId: owner.id
      }
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

