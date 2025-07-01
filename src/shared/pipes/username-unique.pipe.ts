import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { AccountService } from 'src/modules/account/account.service';

@Injectable()
export class UsernameUniquePipe implements PipeTransform {
  constructor(private accountService: AccountService) {}

  async transform(value: { data: { username: string } }) {
    // todo: exempt current user
    const existingUser = await this.accountService.findByUsername(
      value.data.username,
    );
    if (existingUser)
      throw new BadRequestException({
        message: 'Usernames must be unique. Please choose another.',
      });
    return value;
  }
}
