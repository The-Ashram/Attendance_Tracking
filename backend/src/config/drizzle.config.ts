import { defineConfig } from "drizzle-kit";
import dotenv from 'dotenv';
import config from './config';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectionString = `postgres://${config.drizzle.user}:${config.drizzle.pass}@${config.drizzle.host}:${config.server.port}/${config.drizzle.database}`

console.log("connection string: ", connectionString)

export default defineConfig({
    dialect: "postgresql",
    schema: "./src/db/schema/index.ts",
    out: "./src/db/migrations",
    dbCredentials: {
        url: connectionString,
    },
    strict: true
  });