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
  PayloadWithIdData,
  PayloadWithIdUpdate,
} from "../interfaces/users.interfaces";
import { hashPassword } from "../../utils/hashing";
import { createObjectCsvStringifier } from "csv-writer";

const NAMESPACE = "Users-Handler";

type event = {
  source: string;
  payload: Object;
};

type eventHandler = (event: event) => Object;

const exportUsersToCSV: eventHandler = async (event) => {
  const jwtData = event.payload;
  try {
    const usersInDB = await queryGetAllUsers();

    const parseDateTime = (dateTime: string | Date) => {
      const isoString = new Date(dateTime).toISOString(); // Convert to ISO string
      const [date, timeWithMs] = isoString.split("T"); // Split into date and time
      const time = timeWithMs.split(".")[0]; // Remove milliseconds from time
      return date + " " + time;
    };

    usersInDB.forEach((user) => {
      user.updatedAt = parseDateTime(user.updatedAt);
      user.createdAt = parseDateTime(user.createdAt);
    });

    const csvStringifier = createObjectCsvStringifier({
      header: Object.keys(usersInDB[0]).map((key) => ({ id: key, title: key })),
    });

    // Generate the CSV content
    const csvHeader = csvStringifier.getHeaderString();
    const csvBody = csvStringifier.stringifyRecords(usersInDB);

    // Combine the header and body into a single string
    const csvContent = `${csvHeader}${csvBody}`;

    // Return CSV data as a downloadable response
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="users_report.csv"`,
      },
      data: csvContent,
      jwtData: jwtData,
    };
  } catch (error) {
    log.error(NAMESPACE, getErrorMessage(error), error);
    const code = parseInt(getErrorName(error));
    const errorCode = code || 400;
    return {
      statusCode: errorCode,
      error: new Error("Export user(s) request failed."),
    }
  }
}

const getUsers: eventHandler = async (event) => {
  const { id, jwtData } = event.payload as PayloadWithIdData;

  try {
    const usersInDB =
      id == null ? await queryGetAllUsers() : await queryGetUserById(id);
    log.info(NAMESPACE, "---------END OF GET USER(S) PROCESS---------");
    return {
      statusCode: 200,
      data: {
        message: "User(s) have been retrieved.",
        users: usersInDB,
        jwtData: jwtData,
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
  const { id, updateData, jwtData } = event.payload as PayloadWithIdUpdate;
  try {
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }
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
        jwtData: jwtData,
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
  const { id, jwtData } = event.payload as PayloadWithIdData;

  try {
    const deletedUser =
      id == null ? await queryDeleteAllUsers() : await queryDeleteUser(id);
    log.info(NAMESPACE, "---------END OF DELETE USER(S) PROCESS---------");
    return {
      statusCode: 200,
      data: {
        message: "Users has been deleted.",
        users: deletedUser,
        jwtData: jwtData,
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
  exportUsersToCSV
};
