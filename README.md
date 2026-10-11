# Hotel Booking API

## Technology

-   [x] [NestJS 11](https://nestjs.com/) on Node.js >= 20, TypeScript 5.9 (target ES2022).
-   [x] Config Service ([@nestjs/config](https://www.npmjs.com/package/@nestjs/config)).
-   [x] Helmet ([helmet](https://www.npmjs.com/package/helmet)).
-   [x] Rate limiting ([@nestjs/throttler](https://www.npmjs.com/package/@nestjs/throttler)).
-   [x] Database ([typeorm](https://www.npmjs.com/package/typeorm), [@nestjs/typeorm](https://www.npmjs.com/package/@nestjs/typeorm)) on PostgreSQL ([pg](https://www.npmjs.com/package/pg)).
-   [x] Winston Logger ([nest-winston](https://www.npmjs.com/package/nest-winston)), ([winston](https://www.npmjs.com/package/winston)) with Daily Rotation ([winston-daily-rotate-file](https://www.npmjs.com/package/winston-daily-rotate-file)).
-   [x] Mailing ([nodemailer](https://www.npmjs.com/package/nodemailer)).
-   [x] IORedis ([ioredis](https://www.npmjs.com/package/ioredis)).
-   [x] Cache Manager ([@nestjs/cache-manager](https://www.npmjs.com/package/@nestjs/cache-manager)), ([cache-manager](https://www.npmjs.com/package/cache-manager)) v6 (TTL in milliseconds), ([cache-manager-ioredis-yet](https://www.npmjs.com/package/cache-manager-ioredis-yet)).
-   [x] JWT ([@nestjs/jwt](https://www.npmjs.com/package/@nestjs/jwt)) and Passport ([@nestjs/passport](https://www.npmjs.com/package/@nestjs/passport)).
-   [x] Scheduling and events ([@nestjs/schedule](https://www.npmjs.com/package/@nestjs/schedule), [@nestjs/event-emitter](https://www.npmjs.com/package/@nestjs/event-emitter)).
-   [x] WebSockets ([@nestjs/websockets](https://www.npmjs.com/package/@nestjs/websockets), [socket.io](https://socket.io/)).
-   [x] Payments ([stripe](https://www.npmjs.com/package/stripe) 18) and SMS ([twilio](https://www.npmjs.com/package/twilio) 5).
-   [x] AWS SDK v3 (S3).
-   [x] SWC fast compiler ([@swc/cli](https://www.npmjs.com/package/@swc/cli)), ([@swc/core](https://www.npmjs.com/package/@swc/core)), also used by Jest ([@swc/jest](https://www.npmjs.com/package/@swc/jest)).

### Tooling

-   [x] ESLint 9 flat config ([eslint.config.mjs](eslint.config.mjs)) with typescript-eslint and Prettier 3.
-   [x] Jest 30 for unit and e2e tests.
-   [x] Husky 9 + lint-staged: staged `*.ts` files are linted and formatted on commit.
-   [x] Compodoc for API documentation.

## Features

### Admin

-   [x] Sign up and sign in, confirmation via Email (optional, can be detached).
-   [x] Role with Users.
-   [x] Super Admin can activate or deactivate Users.
-   [x] Admin can manage country, state, city and location.
-   [x] Admin can manage hotel, room, and hotel related features.

### Guest

-   [ ] Sign up and sign in, confirmation via Email or SMS.

## Requirements

-   Node.js >= 20
-   Yarn
-   PostgreSQL and Redis

## Installation

```bash
$ yarn install
$ cp .env.example .env   # then fill in the values
```

## Running the app

```bash
# development
$ yarn start

# watch mode (SWC)
$ yarn start:dev

# production mode (build first with `yarn build`)
$ yarn build
$ yarn start:prod
```

## Scripts

```bash
$ yarn type-check          # tsc --noEmit
$ yarn lint                # eslint --fix
$ yarn format              # prettier --write
$ yarn documentation:serve # Compodoc docs
```

## Database migrations

```bash
$ yarn migration:create <path/Name>
$ yarn migration:generate src/infrastructure/database/migrations/Name
$ yarn migration:run
$ yarn migration:revert
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## Stay in touch

-   Author - [Sigit Prayitno](https://github.com/cybergitt)
