import config from "./../../config/config"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import log from "./../../config/log.config"

const NAMESPACE = 'Migrate';

const doMigrate = async () => {
    try {
        const connectionString = `postgresql://${config.drizzle.user}:${config.drizzle.pass}@${config.drizzle.host}:${config.server.port}/${config.drizzle.database}`;
        console.log('migrate string: ', connectionString);
        const attendanceTrackingPG = postgres(connectionString, { max: 1 })
        const db = drizzle(attendanceTrackingPG)

        await migrate(db, {
            migrationsFolder: "./src/db/migrations"
        });
        console.log("Migrations successful!");

        return process.exit(0);
    } catch (e) {
        log.error(NAMESPACE, "Migration error: ", e);
        return process.exit(0);
    }
};

doMigrate();