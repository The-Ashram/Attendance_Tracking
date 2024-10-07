import db from "config/db";
import log from "config/log.config";
import { users } from "db/schema";
import { UsersSchema } from "db/schema/users.schema";
import { eq } from "drizzle-orm";
import { getErrorMessage } from "utils/errorHandler";
import { DatabaseRequestError } from "utils/errorTypes";

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
      "Database query failed to retrieve user(s)! User array retrieved: ",
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
      "Database query failed to retrieve user(s)! Users array retrieved: ",
      allUsers
    );
    const e = new DatabaseRequestError("User(s) do not exist!", "404");
    throw e;
  }

  return allUsers;
}

export const queryGetUserByEmail = async (email: string) => {
  const user = await db
  .select() 
  .from(users)
  .where(eq(users.email, email))  
  .catch((error) => {
    log.error(NAMESPACE, getErrorMessage(error), error);
    const e = new DatabaseRequestError("Database query error.", "501");
    throw e;
  });

  if (user.length.valueOf() === 0) {
    log.error(
      NAMESPACE,
      "Database query failed to retrieve user(s)! User array retrieved: ",
      user
    );
    const e = new DatabaseRequestError("User(s) do not exist!", "404");
    throw e;
  }

  return user;
}

export const queryGetUserByName = async (name: string) => {
  const user = await db
  .select() 
  .from(users)
  .where(eq(users.name, name))  
  .catch((error) => {
    log.error(NAMESPACE, getErrorMessage(error), error);
    const e = new DatabaseRequestError("Database query error.", "501");
    throw e;
  });

  if (user.length.valueOf() === 0) {
    log.error(
      NAMESPACE,
      "Database query failed to retrieve user(s)! User array retrieved: ",
      user
    );
    const e = new DatabaseRequestError("User(s) do not exist!", "404");
    throw e;
  }

  return user;
}