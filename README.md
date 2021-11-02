# LinkTree: Core

Core LinkTree functionality consists of the following micro-services:

- GraphQL API
- REST Hooks
- AMP/HTML renderer
- Events worker

To run everything locally:

1. Run `yarn` command
2. Start local databases with `docker-compose up -d` or setup database settings inside `ormconfig.json`
3. Run `yar start` or `yarn dev` command

## Running services separately

While this project can be run as a monolith web service,
it's recommended to run each service separately as stateless payloads.

To run a service separately add name of the service to `yarn start` or `yarn dev`:

```sh
yarn start graphql
yarn dev amp
```

Commands `yarn start` and `yarn dev` are shorthands for `yarn start all` and `yarn dev all` respectfully.

## Tech

- Written in NodeJS/TypeScript
- PostgreSQL is used as a main database with the help of TypeORM
- Redis is used for caching and microservice communication (through Streams)

### Rendering pages

- Pages are rendered by LiquidJS
- Resulting AMP/HTML is passed through AMP Optimizer
- User pages are stored in DB, but cached in Redis
- Landing pages are rendered from Templates (Liquid), Styles (SASS) and their content (YAML extended markup)

### Subscription

- All payments are processed by Paypal (with REST API)
- Paypal sends notifications to the REST service via WebHooks
- REST Service validates the notification and creates an event
- Events service makes required changes to User subscription

## Notes

- Do not change `"module": "commonjs"` in `tsconfig.json` to anything else, as this is required for TypeORM to work
- Do not place anything but TypeORM entities in the `entities` folders, as it's auto loaded from there.
