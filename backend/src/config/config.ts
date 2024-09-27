import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';
const POSTGRES_DB = process.env.POSTGRES_DB || 'dailytracking';
const POSTGRES_USER = process.env.POSTGRES_USER || 'null_user';
const POSTGRES_PASS = process.env.POSTGRES_PASS || 'null_pw';

const POSTGRES = {
    host: POSTGRES_HOST,
    database: POSTGRES_DB,
    user: POSTGRES_USER,
    pass: POSTGRES_PASS,
};

const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || 'localhost';
const SERVER_PORT = process.env.SERVER_PORT || '8080';

const SERVER = {
    hostname: SERVER_HOSTNAME,
    port: SERVER_PORT,
}

const config = {
    drizzle: POSTGRES,
    server: SERVER,
};

export default config;