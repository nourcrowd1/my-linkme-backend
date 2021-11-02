import "reflect-metadata"; // required by TypeORM

import { Server } from "http";
import { createConnection } from "typeorm";

import { capitalize } from "./lib";

// Microservices
import all from "./services/all";
import graphql from "./services/graphql";
import amp from "./services/amp";
import rest from "./services/rest";
import { redisURL } from "./config";
import  * as cron from "./vendors/cron";

const handlers = {
  all,
  graphql,
  amp,
  rest,
};

// Instance settings
const port = process.env.PORT || 3030;
const service = process.argv[2] ?? "all";
//const service = process.argv[2] == undefined ? "all" : process.argv[2];
const handler = handlers[service];

console.log(`Starting ${service} service`);

const cache = process.env.REDIS_URL && {
  type: "ioredis" as const,
  options: redisURL,
};

console.log('***** NOUR - process.env.PORT: ' + process.env.PORT);

console.log('***** NOUR - process.env.DATABASE_HOST: ' + process.env.DATABASE_HOST);
console.log('***** NOUR - process.env.DATABASE_PASSWORD: ' + process.env.DATABASE_PASSWORD);
console.log('***** NOUR - process.env.DATABASE_USERNAME: ' + process.env.DATABASE_USERNAME);
console.log('***** NOUR - process.env.DATABASE_PORT: ' + process.env.DATABASE_PORT);


createConnection({
  type: "postgres" as const,
  database: process.env.DATABASE || "postgres",
  password: process.env.DATABASE_PASSWORD || "postgres",
  username: process.env.DATABASE_USERNAME || "postgres",
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT as any,
  synchronize: true,
  cache,
  entities: ["src/entities/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: ["src/subscribers/**/*.ts"],
  logging: Boolean(process.env.LOG),
  ssl: process.env.CA_CERT
    ? {
        rejectUnauthorized: false,
        ca: process.env.CA_CERT,
      }
    : false,
}).then(async (connection) => {
  console.log("Database connected:", connection.isConnected);
  console.log("Caching enabled:", Boolean(cache));

  const server = new Server(await handler({ connection }));

  process.once("SIGINT", () => server.close());
  server.listen(port, () =>
    console.log(
      `${capitalize(service)} is listening on http://localhost:${port}`
    )
  );
  cron.start();
});