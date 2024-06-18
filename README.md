<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

<p align="center">
  A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.
</p>

## Description

Hotel Booking API

## Technology

-   [x] Config Service ([@nestjs/config](https://www.npmjs.com/package/@nestjs/config)).
-   [x] Helmet ([helmet](https://www.npmjs.com/package/helmet)).
-   [x] Database ([typeorm](https://www.npmjs.com/package/typeorm)).
-   [x] Winston Logger ([nest-winston](https://www.npmjs.com/package/nest-winston)), ([winston](https://www.npmjs.com/package/winston))
-   [x] Winston Daily Rotation ([winston-daily-rotate-file](https://www.npmjs.com/package/winston-daily-rotate-file))
-   [x] Mailing ([nodemailer](https://www.npmjs.com/package/nodemailer), [@nestjs-modules/mailer](https://www.npmjs.com/package/@nestjs-modules/mailer)).
-   [x] IORedis ([ioredis](https://www.npmjs.com/package/ioredis)).
-   [x] Cache Manager ([@nestjs/cache-manager](https://www.npmjs.com/package/@nestjs/cache-manager)), ([cache-manager](https://www.npmjs.com/package/cache-manager)), ([cache-manager-ioredis-yet](https://www.npmjs.com/package/cache-manager-ioredis-yet)).
-   [x] JWT ([@nestjs/jwt](https://www.npmjs.com/package/@nestjs/jwt)).
-   [x] Passport ([@nestjs/passport](https://www.npmjs.com/package/@nestjs/passport)).
-   [x] SWC fast compiler ([@swc/cli](https://www.npmjs.com/package/@swc/cli)), ([@swc/core](https://www.npmjs.com/package/@swc/core)).
-   [x] AWS SDK v3

## Features

### Admin

-   [x] Sign up and sign in, confirmation via Email (optional, can be detached).
-   [x] Role with Users.
-   [x] Super Admin can activate or deactivate Users.
-   [x] Admin can manage country, state, city and location.
-   [x] Admin can manage hotel, room, and hotel related features.

### Guest

-   [ ] Sign up and sign in, confirmation via Email or SMS.

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Stay in touch

-   Author - [Sigit Prayitno](https://github.com/cybergitt)
