import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Prisma, User } from '@prisma/client';
import { hashPassword } from 'src/shared/helpers/password.helpers';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async clear() {
    for (const query of [
      'PRAGMA foreign_keys = ON',
      'DELETE FROM "User"',
      "DELETE FROM sqlite_sequence WHERE name = 'User'",
    ])
      await this.$queryRaw`${Prisma.raw(query)}`;
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
