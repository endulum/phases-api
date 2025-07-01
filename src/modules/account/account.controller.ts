import {
  Controller,
  Post,
  Get,
  Patch,
  UsePipes,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { ZodValidationPipe } from 'src/shared/pipes/zod-validation.pipe';
import { CreateAccountDto, createAccountSchema } from './dto/signup.dto';
import { UsernameUniquePipe } from 'src/shared/pipes/username-unique.pipe';
import { AuthAccountDto, authAccountSchema } from './dto/login.dto';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { User } from '@prisma/client';
import { UpdateAccountDto, updateAccountSchema } from './dto/update.dto';

@Controller('account')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Post('/signup')
  @UsePipes(new ZodValidationPipe(createAccountSchema), UsernameUniquePipe)
  async signup(@Body() { data }: { data: CreateAccountDto }) {
    return {
      message: 'Account successfully created.',
      data: await this.accountService.createFromData(data),
    };
  }

  @Post('/login')
  @UsePipes(new ZodValidationPipe(authAccountSchema))
  async login(@Body() { data }: { data: AuthAccountDto }) {
    return {
      message: 'Successfully logged in.',
      data: await this.accountService.authFromData(data),
    };
  }

  @Get()
  @UseGuards(AuthGuard)
  get(@Request() { user }: { user: User }) {
    return {
      data: {
        user: {
          id: user.id,
          username: user.username,
        },
      },
    };
  }

  @Patch()
  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(updateAccountSchema), UsernameUniquePipe)
  async update(
    @Request() { user }: { user: User },
    @Body() { data }: { data: UpdateAccountDto },
  ) {
    return {
      message: 'Account successfully updated.',
      data: await this.accountService.updateUserFromData(user, data),
    };
  }
}
