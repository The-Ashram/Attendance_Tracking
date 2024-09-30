import { users, UsersSchema } from "db/schema/users.schema";
import log from "./../../config/log.config"
import { getErrorMessage, getErrorName } from "utils/errorHandler";
import db from "config/db";
import { DatabaseRequestError } from "utils/errorTypes";

const NAMESPACE = "Users-Route";

type event = {
    source: string;
    payload: Object;
}

type eventHandler = (event: event) => Object;

const createNewUser: eventHandler = async (event) => {
    const { name, role, email, password } = event.payload as UsersSchema;
    
    try {

        const usersInDB = await db
            .insert(users)
            .values({
                name: name,
                role: role,
                email: email,
                password: password
            })
            .returning()
            .catch((error) => {
                log.error(NAMESPACE, getErrorMessage(error), error);
                const e = new DatabaseRequestError('Database query error.', '501');
                throw e;
            });
        
        if (usersInDB.length.valueOf() == 0) {
            log.error(
                NAMESPACE,
                'Database query failed to retrieve user(s)! User array retrieved: ',
                usersInDB
                );
                const e = new DatabaseRequestError(
                    'User has not been added to database',
                    '501'
                );
                throw e;
        }
    } catch (error) {
        log.error(NAMESPACE, getErrorMessage(error), error);
        const code = parseInt(getErrorName(error));
        const errorCode = code == null ? 400 : code;
        return {
            statusCode: errorCode,
            error: new Error('Create new user request failed.')
        }
    }
};


export default {
    createNewUser,
}