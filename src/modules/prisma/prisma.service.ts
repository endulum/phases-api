import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Prisma, User } from '@prisma/client';
import { hashPassword } from 'src/shared/helpers/password.helpers';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async clear() {
    await this.$queryRaw`PRAGMA foreign_keys = ON`;
    const allTables: { name: string }[] = await this.$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';
    `;
    for (const table of allTables) {
      if (table.name === '_prisma_migrations') continue;
      await this.$executeRawUnsafe(`DELETE FROM "${table.name}"`);
    }
    await this.$queryRaw`DELETE FROM sqlite_sequence`;
  }

  async createUser(data: Prisma.UserCreateInput) {
    const newUser = await this.user.create({
      data: {
        ...data,
        password: await hashPassword(data.password),
      },
    });
    return newUser;
  }

  async updateUser(user: User, data: Prisma.UserUpdateInput) {
    const updatedUser = await this.user.update({
      where: { id: user.id },
      data: {
        ...data,
        ...(data.password && {
          password: await hashPassword(data.password as string),
        }),
      },
    });
    return updatedUser;
  }
}
