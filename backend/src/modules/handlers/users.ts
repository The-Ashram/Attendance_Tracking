import { users, UsersSchema } from "db/schema/users.schema";
import log from "./../../config/log.config"
import { getErrorMessage, getErrorName } from "utils/errorHandler";
import db from "config/db";
import { DatabaseRequestError } from "utils/errorTypes";
import { eq, sql } from "drizzle-orm";
import { queryGetAllUsers, queryGetUserByName } from "db/queries/users.query";

const NAMESPACE = "Users-Route";

type event = {
    source: string;
    payload: Object;
}

type eventHandler = (event: event) => Object;

const createNewUser: eventHandler = async (event) => {
    const user: UsersSchema = event.payload as UsersSchema;
    
    try {
        const usersInDB = await db
            .insert(users)
            .values(user)
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

const getAllUsers: eventHandler = async (event) => {
    try {
        const usersInDB = await queryGetAllUsers();

        if (!usersInDB.length) {
            log.error(NAMESPACE, 'No users found in database');
            const e = new DatabaseRequestError('Users not found', '404');
            throw e;
        }

        return { statusCode: 200, data: usersInDB };

    } catch (error) {
        log.error(NAMESPACE, getErrorMessage(error), error);
        const code = parseInt(getErrorName(error));
        const errorCode = code || 400;
        return {
            statusCode: errorCode,
            error: new Error('Get all users request failed.')
        };
    }
}

const getUserByName: eventHandler = async (event) => {
    const { name } = event.payload as { name: UsersSchema['name'] };

    try {
        const userInDB = await queryGetUserByName(name);

        if (!userInDB.length) {
            log.error(NAMESPACE, `No user found with id ${name}`);
            const e = new DatabaseRequestError('User not found', '404');
            throw e;
        }

        return { statusCode: 200, data: userInDB };
    } catch (error) {
        log.error(NAMESPACE, getErrorMessage(error), error);
        const code = parseInt(getErrorName(error));
        const errorCode = code || 400;
        return {
            statusCode: errorCode,
            error: new Error('Get user by Name request failed.')
        };
    }
};

const updateUser: eventHandler = async (event) => {
    const { id, updateData } = event.payload as { id: number; updateData: Partial<UsersSchema> };

    try {
        const updatedUser = await db
            .update(users)
            .set(updateData)
            .where(sql`${users.id} = ${id}`)
            .returning()
            .catch((error) => {
                log.error(NAMESPACE, getErrorMessage(error), error);
                const e = new DatabaseRequestError('Database query error.', '501');
                throw e;
            });

        if (!updatedUser.length) {
            log.error(NAMESPACE, `Failed to update user with id ${id}`);
            const e = new DatabaseRequestError('User not updated', '404');
            throw e;
        }

        return { statusCode: 200, data: updatedUser };
    } catch (error) {
        log.error(NAMESPACE, getErrorMessage(error), error);
        const code = parseInt(getErrorName(error));
        const errorCode = code || 400;
        return {
            statusCode: errorCode,
            error: new Error('Update user request failed.')
        };
    }
};

const deleteUser: eventHandler = async (event) => {
    const { id } = event.payload as { id: number };

    try {
        const deletedUser = await db
            .delete(users)
            .where(sql`${users.id} = ${id}`)
            .returning()
            .catch((error) => {
                log.error(NAMESPACE, getErrorMessage(error), error);
                const e = new DatabaseRequestError('Database query error.', '501');
                throw e;
            });

        if (!deletedUser.length) {
            log.error(NAMESPACE, `Failed to delete user with id ${id}`);
            const e = new DatabaseRequestError('User not found', '404');
            throw e;
        }

        return { statusCode: 200, data: deletedUser };
    } catch (error) {
        log.error(NAMESPACE, getErrorMessage(error), error);
        const code = parseInt(getErrorName(error));
        const errorCode = code || 400;
        return {
            statusCode: errorCode,
            error: new Error('Delete user request failed.')
        };
    }
};

export default {
    createNewUser,
    getAllUsers,
    getUserByName,
    updateUser,
    deleteUser
}