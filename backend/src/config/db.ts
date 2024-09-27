import { PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres';
import config from './config';
import * as schema from '../db/schema';

const connectionString = 
    `postgres://${config.drizzle.user}:${config.drizzle.pass}@${config.drizzle.host}:${config.server.port}/${config.drizzle.database}` ||
    `postgres://ashram99:Ashram99HEB@localhost:5432/dailytracking`

console.log(connectionString)

const dailyTrackingQueryClient = postgres(connectionString, { max: 1 });

const db: PostgresJsDatabase<typeof schema> = drizzle(dailyTrackingQueryClient, {
    schema,
});

export default db;