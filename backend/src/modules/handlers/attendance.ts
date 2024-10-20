import log from "../../config/log.config";
import { getErrorMessage, getErrorName } from "../../utils/errorHandler";
import { DatabaseRequestError } from "../../utils/errorTypes";
import {
  queryCreateAttendance,
  queryDeleteAllAttendances,
  queryDeleteAttendance,
  queryGetAllAttendances,
  queryGetAttendanceByDay,
  queryGetAttendanceById,
  queryUpdateAttendance,
} from "../../db/queries/attendance.query";
import { PayloadWithId, PayloadWithIdData } from "../interfaces/general.interfaces";
import { AttendanceSchema } from "../../db/schema/attendance.schema";
import { PayloadWithDataCreateBody, PayloadWithIdDataDate, PayloadWithIdUpdate } from "../interfaces/attendance.interfaces";
const NAMESPACE = "Attendance-Handler";

type event = {
  source: string;
  payload: Object;
};

type eventHandler = (event: event) => Object;

const createAttendance: eventHandler = async (event) => {
  const { createData, jwtData } = event.payload as PayloadWithDataCreateBody;

  try {
    const createdAttendance = await queryCreateAttendance(createData);
    log.info(NAMESPACE, "---------END OF CREATE ATTENDANCE PROCESS---------");
    return {
      statusCode: 201,
      data: {
        message: "Attendance has been created.",
        attendance: createdAttendance,
        jwtData: jwtData,
      },
    };
  } catch (error) {
    log.error(NAMESPACE, getErrorMessage(error), error);
    const code = parseInt(getErrorName(error));
    const errorCode = code == null ? 400 : code;
    return {
      statusCode: errorCode,
      error: new Error("Create attendance request failed."),
    };
  }
}

const getAttendances: eventHandler = async (event) => {
  const { id, jwtData, date } = event.payload as PayloadWithIdDataDate;
  try {
    const attendancesInDB =
      id == null ? 
        (date == null ? 
          await queryGetAllAttendances() 
          : await queryGetAttendanceByDay(date.toDateString()))
        : await queryGetAttendanceById(id);
    log.info(NAMESPACE, "---------END OF GET ATTENDANCE(S) PROCESS---------");
    return {
      statusCode: 200,
      data: {
        message: "Attendance(s) have been retrieved.",
        attendances: attendancesInDB,
        jwtData: jwtData,
      },
    };
  } catch (error) {
    log.error(NAMESPACE, getErrorMessage(error), error);
    const code = parseInt(getErrorName(error));
    const errorCode = code || 400;
    return {
      statusCode: errorCode,
      error: new Error("Get attendance(s) request failed."),
    };
  }
};

const updateAttendance: eventHandler = async (event) => {
  const { id, jwtData, updateData } = event.payload as PayloadWithIdUpdate;
  try {
    if (id == null) {
      throw new DatabaseRequestError("Attendance id cannot be null.", "400");
    }
    const updatedAttendance = await queryUpdateAttendance(id, updateData);
    log.info(NAMESPACE, "---------END OF UPDATE ATTENDANCE PROCESS---------");
    return {
      statusCode: 200,
      data: {
        message: "Attendance has been updated.",
        attendance: updatedAttendance,
        jwtData: jwtData,
      },
    };
  } catch (error) {
    log.error(NAMESPACE, getErrorMessage(error), error);
    const code = parseInt(getErrorName(error));
    const errorCode = code || 400;
    return {
      statusCode: errorCode,
      error: new Error("Update attendance request failed."),
    };
  }
};

const deleteAttendances: eventHandler = async (event) => {
  const { id, data } = event.payload as PayloadWithIdData;
  try {
    const deletedAttendances =
      id == null
        ? await queryDeleteAllAttendances()
        : await queryDeleteAttendance(id);
    log.info(NAMESPACE, "---------END OF DELETE ATTENDANCE(S) PROCESS---------");
    return {
      statusCode: 200,
      data: {
        message: "Attendances has been deleted.",
        attendances: deletedAttendances,
        jwtData: data,
      },
    };
  } catch (error) {
    log.error(NAMESPACE, getErrorMessage(error), error);
    const code = parseInt(getErrorName(error));
    const errorCode = code == null ? 400 : code;
    return {
      statusCode: errorCode,
      error: new Error("Delete attendance(s) request failed."),
    };
  }
};

export default {
  createAttendance, 
  getAttendances,
  updateAttendance,
  deleteAttendances
};
