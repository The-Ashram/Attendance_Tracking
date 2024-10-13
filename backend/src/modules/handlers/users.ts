import log from "./../../config/log.config";
import { getErrorMessage, getErrorName } from "../../utils/errorHandler";
import { DatabaseRequestError } from "../../utils/errorTypes";
import {
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


const NAMESPACE = "Users-Handler";

type event = {
  source: string;
  payload: Object;
};

type eventHandler = (event: event) => Object;

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
  getUsers,
  updateUser,
  deleteUsers,
};
