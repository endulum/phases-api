import { Prisma, PrismaClient } from '@prisma/client';

const client = new PrismaClient();

async function main() {
  // truncate users
  for (const query of [
    'PRAGMA foreign_keys = ON',
    'DELETE FROM "User"',
    "DELETE FROM sqlite_sequence WHERE name = 'User'",
  ])
    await client.$queryRaw`${Prisma.raw(query)}`;

  // repopulate users
  for (const username of ['demo-1', 'demo-2', 'demo-3'])
    await client.user.create({
      data: {
        username,
        password: 'correct horse battery staple',
      },
    });
}

main()
  .then(async () => {
    await client.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await client.$disconnect();
    process.exit(1);
  });
