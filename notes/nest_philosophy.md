Nest combines elements of

- object-oriented programming
- functional programming
- functional reactive programming

Nest arose as a solution to project architecture. Nest's architecture promotes testable, scalable, loosely coupled, easily maintainable projects.

Components of a module:

- `app.controller.ts`: route and response logic
- `app.service.ts`: business logic
- `app.module.ts`: wrapping up structure into scopes

## Controllers

Handles incoming requests and sends responses.

Controller handlers take advantage of decorators in multiple areas.

Decorators in route parameters help route handlers access the metadata of the request. In the handler's signature, to access a metadata object, inject the decorator for that object prior to the parameter name representing the object.

```ts
@Controller('cats') // create a controller for the prefix `cats/`
export class CatsController {
  @Get() // create a handler for the endpoint `GET cats/`
  findAll(@Query() query: any): string {
    // @Query is a decorator for injecting the query object
    // you can access request queries here
    console.log(query);
    return 'This action returns all cats';
  }

  @Get(':id') // create a handler for the endpoint `GET cats/:id`
  findOne(@Param() params: any): string {
    // @Param is a decorator for injecting the parameter object
    // you can access request parameters here
    console.log(params);
    return 'This action returns a specific cat';
  }

  @Post() // create a handler for the endpoint `POST /cats`
  create(@Body() body: any) {
    // @Body is a decorator for injecting the body object
    // you can access body payload here
    console.log(body);
    return 'This action adds a new cat';
  }
}
```

> _In Nest, nearly everything is shared across incoming requests._

### Request payloads

Previous example described the `POST /cats` route like this:

```ts
@Post()
create(@Body() body: any) {
  console.log(body);
  return 'This action adds a new cat';
}
```

But you can type `body` using a data transfer object:

```ts
@Post()
create(@Body() createCatDto: CreateCatDto) {
  return `This action adds a new cat named ${createCatDto.name}`;
}
```

While declaring the data transfer object elsewhere, as a class:

```ts
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
```

Defining a DTO comes in very handy for pipes.

## Providers

Services, helpers, factories, etc... whatever handles business logic, all exist under the "provider" umbrella. Providers are _injectable_ as dependencies.

```ts
@Injectable()
export class WorkersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateWorker): Promise<Worker> {
    return await this.prisma.worker.create({ data });
  }

  async getById(id: number): Promise<Worker | null> {
    return await this.prisma.worker.findUnique({ where: { id } });
  }
}
```

And wouldn't you know it, Prisma has a service, too...

```ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // ...
}
```

And it _extends_ `PrismaClient`! So wherever we need the Prisma service, we can use a built-in Prisma query, or we can write up a handy function multi-logic of our own here, and refer to that instead.

Mainly, note the `@Injectable()`. This decorator _attaches metadata to the class_ which signals that the service can be used by the Nest "inversion of control" container. Injection actually happens through the class constructor. So in the Prisma service, if we wanted to inject some other service, we'd say..

```ts
constructor(private someOtherService: SomeOtherService) {}
```

And in our Workers service, we call upon the Prisma service:

```ts
constructor(private readonly prisma: PrismaService) {}
```

And in a hypothetical Workers controller, we'd call upon _that_:

```ts
@Controller('workers')
export class WorkersController {
  constructor(private readonly service: WorkersService) {}
  // ...
}
```

### Let's talk about dependency injection

[Angular's guide on the subject.](https://angular.dev/guide/di)

Sometimes, one part of a system needs to use features from another part of the system.

**Dependency injection** is one way to deliver parts of a system across the system to satisfy this.

In a DI relationship there is a "consumer" and "provider". An abstraction called an `Injector` is a layer connecting the two.

```ts
@Injectable()
class CatsService {}
```

`CatsService` needs to act as a dependency in a component. In other words, some other part of the system will want `CatsService`. `@Injectable` signals to the DI layer that `CatsService` is injectable.

You'll need to make the application aware of `CatsService`. In Nest, provider registration is a matter of adding `CatsService` to the `providers` array of the nearest module relevant declaration.

```ts
@Module({
  // ...
  providers: [CatsService],
})
```

Now we can deliver, or "inject", `CatsService` to wherever we want. Nest uses constructor-based injection:

```ts
constructor(private catsService: CatsService) {}
```

## Modules

The `@Module` decorator _provides metadata that Nest uses to organize and manage the application structure._

For the application exists an "application graph", which is _an internal structure that Nest uses to resolve relationships and dependencies between modules and providers._

Logic should be grouped into specialized modules.

```
src
├── modules
│   ├── prisma
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── shifts
│   │   ├── shifts.controller.ts
│   │   ├── shifts.module.ts
│   │   ├── shifts.schemas.ts
│   │   └── shifts.service.ts
│   ├── workers
│   │   ├── workers.controller.ts
│   │   ├── workers.module.ts
│   │   ├── workers.schemas.ts
│   │   └── workers.service.ts
│   └── workplaces
│       ├── workplaces.controller.ts
│       ├── workplaces.module.ts
│       ├── workplaces.schemas.ts
│       └── workplaces.service.ts
...
```

Each resource has a `module.ts` that wraps up the logic of that resource into a module. They each look something like this...

```ts
import { Module } from '@nestjs/common';

import { WorkersController } from './workers.controller';
import { WorkersService } from './workers.service';

@Module({
  controllers: [WorkersController],
  providers: [WorkersService],
})
export class WorkersModule {}
```

> This encapsulation lets it be reusable, too. The same `WorkersModule` instance is being used no matter how many files import it.

And the `app.module.ts`, the "root module", the starting point from which Nest builds the application graph, wraps up each of the modules into one for `main.ts` to use.

```ts
import { Global, Module } from '@nestjs/common';

import { PrismaModule } from './modules/prisma/prisma.module';
import { ShiftsModule } from './modules/shifts/shifts.module';
import { WorkersModule } from './modules/workers/workers.module';
import { WorkplacesModule } from './modules/workplaces/workplaces.module';

@Global()
@Module({
  imports: [PrismaModule, ShiftsModule, WorkersModule, WorkplacesModule],
})
export class AppModule {}
```

In a way, a module is being given an API.

## Middleware

So far,

- Controllers handle routes.
- Providers handle business logic.
- Modules encapsulate controllers, providers, and other modules for a resource.

Let's talk about what happens before the route handler, middleware.

```ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...');
    next();
  }
}
```

```ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('cats');
  }
}
```

What just happened? First, a middleware function `LoggerMiddleware` is created, marked by the `@Injectable` decorator and extending the in-house `NestModule` interface. Then, `LoggerMiddleware` is set up at the `AppModule` level. When a route prefixes with "cats" is hit, `LoggerMiddleware` will do work. You could get more specific...

```ts
consumer
  .apply(LoggerMiddleware)
  .forRoutes({ path: 'cats', method: RequestMethod.GET });
```

```ts
consumer.apply(LoggerMiddleware).forRoutes(CatsController);
```

```ts
consumer
  .apply(LoggerMiddleware)
  .exclude({ path: 'cats', method: RequestMethod.POST })
  .forRoutes(CatsController);
```

You can apply more than one, in sequence:

```ts
consumer.apply(cors(), helmet(), LoggerMiddleware).forRoutes(CatsController);
```

Want it globally? Make the app use it directly. The dependency injection layer is not provided here, though, so these could only be functional middleware.

```ts
const app = await NestFactory.create(AppModule);
app.use(cors(), helmet());
await app.listen(process.env.PORT ?? 3000);
```
