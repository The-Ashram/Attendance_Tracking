import db from "../../config/db";
import log from "../../config/log.config";
import { users } from "../../db/schema";
import { UsersSchema } from "../../db/schema/users.schema";
import { eq, sql } from "drizzle-orm";
import { getErrorMessage } from "../../utils/errorHandler";
import { DatabaseRequestError } from "../../utils/errorTypes";

const NAMESPACE = "Users-Query";

export const queryCreateUser = async (user: UsersSchema) => {
  const createdUser = await db
  .insert(users)
  .values(user)
  .returning({ id:users.id, name: users.name, role: users.role, email: users.email, password: users.password })
  .catch((error) => {
    log.error(NAMESPACE, getErrorMessage(error), error);
    const e = new DatabaseRequestError("Database query error.", "501");
    throw e;
  });
  
  if (createdUser.length.valueOf() === 0) {
    log.error(
      NAMESPACE,
      "Database create user query failed to retrieve user(s)! User array retrieved: ",
      createdUser
    );
    const e = new DatabaseRequestError("User has not been added to database", "501");
    throw e;
  }

  return createdUser;
}

export const queryGetAllUsers = async () => {
  const allUsers = await db
  .select()
  .from(users)
  .catch((error) => {
    log.error(NAMESPACE, getErrorMessage(error), error);
    const e = new DatabaseRequestError("Database query error.", "501");
    throw e;
  });

  if (allUsers.length.valueOf() === 0) {
    log.error(
      NAMESPACE,
      "Database get all users query failed to retrieve user(s)! Users array retrieved: ",
      allUsers
    );
    const e = new DatabaseRequestError("User(s) do not exist!", "404");
    throw e;
  }

  return allUsers;
}

export const queryGetUserById = async (id: string) => {
  const user = await db
  .select() 
  .from(users)
  .where(sql`${users.id} = ${id}`)
  .catch((error) => {
    log.error(NAMESPACE, getErrorMessage(error), error);
    const e = new DatabaseRequestError("Database query error.", "501");
    throw e;
  });

  if (user.length.valueOf() === 0) {
    log.error(
      NAMESPACE,
      `Database get user by id query failed for user id: ${id}! User array retrieved: `,
      user
    );
    const e = new DatabaseRequestError("User does not exist!", "404");
    throw e;
  }

  return user;
}

export const queryUpdateUser = async (id: string, user: Partial<UsersSchema>) => {
  const updatedUser = await db
  .update(users)
  .set(user)
  .where(sql`${users.id} = ${id}`)
  .returning({ id:users.id, name: users.name, role: users.role, email: users.email, password: users.password })
  .catch((error) => {
    log.error(NAMESPACE, getErrorMessage(error), error);
    const e = new DatabaseRequestError("Database query error.", "501");
    throw e;
  });
  log.info(NAMESPACE, "Updated user obj: ", updatedUser);
  if (!updatedUser.length) {
    log.error(
      NAMESPACE,
      `Database update user query failed for user id: ${id}! User array retrieved: `,
      updatedUser
    );
    const e = new DatabaseRequestError("User has not been updated", "404");
    throw e;
  }

  return updatedUser;
}

export const queryDeleteUser = async (id: string) => {
  const deletedUser = await db
  .delete(users)
  .where(sql`${users.id} = ${id}`)
  .returning({ id:users.id, name: users.name, role: users.role, email: users.email, password: users.password })
  .catch((error) => {
    log.error(NAMESPACE, getErrorMessage(error), error);
    const e = new DatabaseRequestError("Database query error.", "501");
    throw e;
  });

  if (!deletedUser.length) {
    log.error(NAMESPACE, `Database delete user query failed for user id: ${id}! User array retrieved: `, deletedUser);
    const e = new DatabaseRequestError('User not found', '404');
    throw e;
}

  return deletedUser;
}

export const queryDeleteAllUsers = async () => {
  const deletedUsers = await db
  .delete(users)
  .returning({ id:users.id, name: users.name, role: users.role, email: users.email, password: users.password })
  .catch((error) => {
    log.error(NAMESPACE, getErrorMessage(error), error);
    const e = new DatabaseRequestError("Database query error.", "501");
    throw e;
  });

  if (!deletedUsers.length) {
    log.error(NAMESPACE, `Database delete all users query failed! User array retrieved: `, deletedUsers);
    const e = new DatabaseRequestError('Users not found', '404');
    throw e;
  }

  return deletedUsers;
}