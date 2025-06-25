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
import config from "../../config/config";
import { generateToken } from "../../utils/jwt";
import { LogsSchema } from "../../db/schema/logs.schema";
import { queryCreateLog } from "../../db/queries/logs.query";

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
  let passwordIsUpdated = false
  try {
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
      passwordIsUpdated = true
    }
    if (id == null) {
      throw new DatabaseRequestError("User id cannot be null.", "400");
    }
    const oldUser = await queryGetUserById(id);
    const updatedUser = await queryUpdateUser(id, updateData);
    // Get name of admin
    const adminUser = await queryGetUserById(jwtData.id);
    log.info(NAMESPACE, "---------INSERTING UPDATE USER LOG---------");
    // Format the updated record as a string
    const updatedRecord = `Before:
  Name: ${oldUser[0].name}
  Email: ${oldUser[0].email}
  Role: ${oldUser[0].role}
  Password: ${oldUser[0].password}
  Phone Number: ${oldUser[0].phoneNumber}
  Phase Number: ${oldUser[0].phaseNumber}
  To Note: ${oldUser[0].toNote}
  Employee ID: ${oldUser[0].employeeID}
  Created At: ${oldUser[0].createdAt}
  Updated At: ${oldUser[0].updatedAt}

After:
  Name: ${updatedUser[0].name}
  Email: ${updatedUser[0].email}
  Role: ${updatedUser[0].role}
  Password: ${updatedUser[0].password}
  Phone Number: ${updatedUser[0].phoneNumber}
  Phase Number: ${updatedUser[0].phaseNumber}
  To Note: ${updatedUser[0].toNote}
  Employee ID: ${updatedUser[0].employeeID}
  Updated At: ${updatedUser[0].updatedAt}`;
    const logRecord: LogsSchema = {
      tableName: "users",
      recordId: id.toString(),
      actionType: "UPDATE",
      changes: updatedRecord,
      createdBy: adminUser[0].name
    }
    const logRecordInDB = await queryCreateLog(logRecord);
    log.info(NAMESPACE, "Inserted log: ", logRecordInDB);
    log.info(NAMESPACE, "---------END OF UPDATE USER PROCESS---------");
    if (passwordIsUpdated && updatedUser[0].id == jwtData.id) {
      // sign the jwt tokens again as pw has changed
      const accessPrivateKey = Buffer.from(
        config.server.access_private_secret,
        "base64"
      ).toString("ascii");
      const refreshPrivateKey = Buffer.from(
        config.server.refresh_private_secret,
        "base64"
      ).toString("ascii");

      const accessToken = generateToken(
        { id: updatedUser[0].id, email: updatedUser[0].email, role: updatedUser[0].role },
        accessPrivateKey,
        "accessToken"
      );
      const refreshToken = generateToken(
        { id: updatedUser[0].id, email: updatedUser[0].email, role: updatedUser[0].role },
        refreshPrivateKey,
        "refreshToken"
      );
      return {
        statusCode: 200,
        data: {
          message: "User has been updated. New jwt tokens issued!",
          user: updatedUser,
          accessToken: accessToken,
          refreshToken: refreshToken,
          jwtData: jwtData,
        },
      }
    }
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
    // Get name of admin
    log.info(NAMESPACE, "id of admin: ", jwtData.id);
    const adminUser = await queryGetUserById(jwtData.id);
    log.info(NAMESPACE, "---------INSERTING DELETE USER LOG---------");
    const userChanges = id == null
      ? deletedUser.map((user) => `ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`).join("\n")
      : `ID: ${deletedUser[0].id}, Name: ${deletedUser[0].name}, Email: ${deletedUser[0].email}`;

    const logRecord: LogsSchema = {
      tableName: "users",
      recordId: id == null
        ? deletedUser.map((user) => user.id.toString()).join(", ")
        : id.toString(),
      actionType: "DELETE",
      changes: userChanges,
      createdBy: adminUser[0].name
    }
    const logRecordInDB = await queryCreateLog(logRecord);
    log.info(NAMESPACE, "Inserted log: ", logRecordInDB);
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
