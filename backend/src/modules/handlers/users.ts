import { users, UsersSchema } from "../../db/schema/users.schema";
import log from "./../../config/log.config";
import { getErrorMessage, getErrorName } from "../../utils/errorHandler";
import db from "../../config/db";
import { DatabaseRequestError } from "../../utils/errorTypes";
import { eq, sql } from "drizzle-orm";
import {
  queryCreateUser,
  queryDeleteAllUsers,
  queryDeleteUser,
  queryGetAllUsers,
  queryGetUserById,
  queryUpdateUser,
} from "../../db/queries/users.query";
import {
  PayloadWithId,
  PayloadWithIdUpdate,
} from "../interfaces/users.interfaces";
import { generateToken } from "../../utils/jwt";
import { comparePassword } from "../../utils/hashing";
import { LoginRequestBody } from "../interfaces/users.interfaces";
import bcrypt from "bcrypt";

const NAMESPACE = "Users-Handler";

type event = {
  source: string;
  payload: Object;
};

type eventHandler = (event: event) => Object;
const loginUser: eventHandler = async (event) => {
  const { email, password } = event.payload as LoginRequestBody;

  if (!email || !password) {
    log.error(NAMESPACE, "Email and password are required ");
    const e = new DatabaseRequestError(
      "Email and password are required",
      "400"
    );
    throw e;
  }

  try {
    const usersResult = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const user = usersResult[0];

    if (!user) {
      log.error(NAMESPACE, "Invalid user ");
      const e = new DatabaseRequestError("Invalid user", "401");
      throw e;
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      log.error(NAMESPACE, "Invalid password ");
      const e = new DatabaseRequestError("Invalid password", "401");
      throw e;
    }

    // Generate JWT token
    const token = generateToken({ id: user.id, email: user.email });

    return {
      statusCode: 200,
      data: {
        message: "Login successful",
        user: user,
      },
    };
  } catch (error) {
    log.error(NAMESPACE, getErrorMessage(error), error);
    const code = parseInt(getErrorName(error));
    const errorCode = code || 400;
    return {
      statusCode: errorCode,
      error: new Error("Get user(s) request failed."),
    };
  }
};

const createNewUser: eventHandler = async (event) => {
  const user: UsersSchema = event.payload as UsersSchema;
  user.password = await bcrypt.hash(user.password, 10);

  try {
    const userInDB = await queryCreateUser(user);
    log.info(NAMESPACE, "---------END OF CREATE NEW USER PROCESS---------");
    return {
      statusCode: 201,
      data: {
        message: "User has been added to database.",
        user: userInDB,
      },
    };
  } catch (error) {
    log.error(NAMESPACE, getErrorMessage(error), error);
    const code = parseInt(getErrorName(error));
    const errorCode = code == null ? 400 : code;
    return {
      statusCode: errorCode,
      error: new Error("Create new user request failed."),
    };
  }
};

const getUsers: eventHandler = async (event) => {
  const { id } = event.payload as PayloadWithId;

  try {
    const usersInDB =
      id == null ? await queryGetAllUsers() : await queryGetUserById(id);
    log.info(NAMESPACE, "---------END OF GET USER(S) PROCESS---------");
    return {
      statusCode: 200,
      data: {
        message: "User(s) have been retrieved.",
        users: usersInDB,
      },
    };
  } catch (error) {
    log.error(NAMESPACE, getErrorMessage(error), error);
    const code = parseInt(getErrorName(error));
    const errorCode = code || 400;
    return {
      statusCode: errorCode,
      error: new Error("Get user(s) request failed."),
    };
  }
};

const updateUser: eventHandler = async (event) => {
  const { id, updateData } = event.payload as PayloadWithIdUpdate;

  try {
    if (id == null) {
      throw new DatabaseRequestError("User id cannot be null.", "400");
    }
    const updatedUser = await queryUpdateUser(id, updateData);
    log.info(NAMESPACE, "---------END OF UPDATE USER PROCESS---------");
    return {
      statusCode: 200,
      data: {
        message: "User has been updated.",
        user: updatedUser,
      },
    };
  } catch (error) {
    log.error(NAMESPACE, getErrorMessage(error), error);
    const code = parseInt(getErrorName(error));
    const errorCode = code || 400;
    return {
      statusCode: errorCode,
      error: new Error("Update user request failed."),
    };
  }
};

const deleteUsers: eventHandler = async (event) => {
  const { id } = event.payload as PayloadWithId;

  try {
    const deletedUser =
      id == null ? await queryDeleteAllUsers() : await queryDeleteUser(id);
    log.info(NAMESPACE, "---------END OF DELETE USER(S) PROCESS---------");
    return {
      statusCode: 200,
      data: {
        message: "Users has been deleted.",
        users: deletedUser,
      },
    };
  } catch (error) {
    log.error(NAMESPACE, getErrorMessage(error), error);
    const code = parseInt(getErrorName(error));
    const errorCode = code || 400;
    return {
      statusCode: errorCode,
      error: new Error("Delete user(s) request failed."),
    };
  }
};

export default {
  createNewUser,
  getUsers,
  updateUser,
  deleteUsers,
  loginUser,
};
