import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { type User } from '@prisma/client';
import { comparePasswords } from 'src/shared/helpers/password.helpers';
import { CreateAccountDto } from './dto/signup.dto';
import { AuthAccountDto } from './dto/login.dto';
import { UpdateAccountDto } from './dto/update.dto';

@Injectable()
export class AccountService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async createFromData(data: CreateAccountDto) {
    const newUser = await this.prisma.createUser({
      username: data.username,
      password: data.password,
    });

    return {
      newUser: { id: newUser.id, username: newUser.username },
    };
  }

  async authFromData(data: AuthAccountDto) {
    const existingUser = await this.findByUsername(data.username);
    if (existingUser) {
      const match = await comparePasswords(
        existingUser.password,
        data.password,
      );
      if (match) {
        const payload = {
          id: existingUser.id,
          username: existingUser.username,
        };
        const token = await this.jwt.signAsync(payload);
        return { token };
      }
    }
    throw new BadRequestException({
      message: 'Incorrect username or password.',
    });
  }

  async updateUserFromData(user: User, data: UpdateAccountDto) {
    let updatedPassword = false;
    if (data.password) {
      updatedPassword = true;
      const match = await comparePasswords(
        user.password,
        data.currentPassword ?? '',
      );
      if (!match) {
        throw new BadRequestException({
          message: 'Incorrect password.',
        });
      }
    }

    const updatedUser = await this.prisma.updateUser(user, {
      username: data.username,
      ...(data.password && { password: data.password }),
    });

    return {
      updatedUser: {
        id: updatedUser.id,
        username: updatedUser.username,
      },
      updatedPassword,
    };
  }
}
