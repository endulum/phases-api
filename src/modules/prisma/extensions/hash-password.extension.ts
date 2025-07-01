import { Prisma } from '@prisma/client';
import { hashPassword } from 'src/shared/helpers/password.helpers';

export const hashPasswordsExtension = Prisma.defineExtension({
  name: 'hash passwords',
  model: {
    user: {
      async $allOperations({
        operation,
        args,
        query,
      }: {
        operation: string;
        args: Prisma.UserCreateArgs | Prisma.UserUpdateArgs;
        query: (...args: any[]) => void;
      }) {
        console.log(operation);
        if (['create', 'update'].includes(operation) && args.data.password) {
          args.data.password = await hashPassword(args.data.password as string);
        }
        return query(args);
      },
    },
  },
});

/*

NOT IMPLEMENTED.

i could not figure out how to wire up this extension to the prisma service;
the extension would just not run.

implementing this will help reduce the redundancy that createUser and updateUser
has, and allow me to use [prismaClient].user.create() directly. maybe some other day.

*/
