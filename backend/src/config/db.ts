import postgres from 'postgres';
import config from './config';

const connectionString = 
    `postgres://${config.drizzle.user}:${config.drizzle.pass}@${config.drizzle.host}:${config.server.port}/${config.drizzle.database}` ||
    `postgres://ashram99:Ashram99HEB@localhost:5432/dailytracking`

console.log(connectionString)
