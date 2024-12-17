import log from "../../config/log.config";
import path from "path";
import { getErrorMessage, getErrorName } from "../../utils/errorHandler";
import { DatabaseRequestError } from "../../utils/errorTypes";
import {
  queryCreateAttendance,
  queryDeleteAllAttendances,
  queryDeleteAttendance,
  queryGetAllAttendances,
  queryGetAttendanceByDay,
  queryGetAttendanceByStartEndDay,
  queryGetAttendanceByUserId,
  queryUpdateAttendance,
} from "../../db/queries/attendance.query";
import { PayloadWithDataCreateBody, PayloadWithIdData, PayloadWithIdDataDate, PayloadWithIdUpdate } from "../interfaces/attendance.interfaces";
import { createObjectCsvStringifier } from "csv-writer";
import { queryGetUserByAttendanceRecords } from "../../db/queries/users.query";
import { attendance } from "../../db/schema";

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

const exportAttendanceToCSV: eventHandler = async (event) => {
  const { jwtData, date, startDate, endDate } = event.payload as PayloadWithIdDataDate;
  try {
    let recordsInDB = null;
    if (date == null) {
      if (startDate == null || endDate == null) {
        throw new DatabaseRequestError("Date or from and to fields cannot be null.", "400");
      } else {
        recordsInDB = await queryGetAttendanceByStartEndDay(startDate.toDateString(), endDate.toDateString());
      }
    } else {
      recordsInDB = await queryGetAttendanceByDay(date.toDateString());
    }

    // join attendance records with users records for the same userID on only name field
    const userRecords = await queryGetUserByAttendanceRecords(recordsInDB);

    log.info(NAMESPACE, `User records updatedAt format: ${userRecords[0].updatedAt}`);
    // Join the matching name column from userRecords to the recordsInDB array
    const combinedRecordsInDB = recordsInDB.map((record) => {
      const matchingUserRecord = userRecords.find((userRecord) => userRecord.id === record.userId);
      const parseDateTime = (dateTime: string | Date) => {
        const isoString = new Date(dateTime).toISOString(); // Convert to ISO string
        const [date, timeWithMs] = isoString.split("T"); // Split into date and time
        const time = timeWithMs.split(".")[0]; // Remove milliseconds from time
        return date + " " + time;
      };
      return {
        id: record.id,
        eventId: record.eventId,
        userId: record.userId,
        name: matchingUserRecord?.name,
        attendanceDate: record.attendanceDate,
        status: record.status,
        reason: record.reason,
        remarks: record.remarks,
        checkInTime: record.checkInTime,
        checkInVerifiedBy: record.checkInVerifiedBy,
        checkOutTime: record.checkOutTime,
        checkOutVerifiedBy: record.checkOutVerifiedBy,
        returnBy: record.returnBy,
        createdAt: parseDateTime(new Date(record.createdAt)),
        updatedAt: parseDateTime(new Date(record.updatedAt)),
      }
    });

    const csvStringifier = createObjectCsvStringifier({
      header: Object.keys(combinedRecordsInDB[0]).map((key) => ({ id: key, title: key })),
    });

    // Generate the CSV content
    const csvHeader = csvStringifier.getHeaderString();
    const csvBody = csvStringifier.stringifyRecords(combinedRecordsInDB);

    // Combine header and body into a single string
    const csvData = csvHeader + csvBody;

    // Create a dynamic file name
    let filename = "attendance_report.csv"; // Default filename
    if (startDate && endDate) {
      const formattedStartDate = startDate.toISOString().split("T")[0]; // YYYY-MM-DD
      const formattedEndDate = endDate.toISOString().split("T")[0]; // YYYY-MM-DD
      filename = `attendance_report_${formattedStartDate}_to_${formattedEndDate}.csv`;
    } else if (date) {
      const formattedDate = date.toISOString().split("T")[0]; // YYYY-MM-DD
      filename = `attendance_report_${formattedDate}.csv`;
    }
    
    // Return CSV data as a downloadable response
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="${filename}"` },
      data: csvData,
      jwtData: jwtData
    };
  } catch (error) {
    log.error(NAMESPACE, getErrorMessage(error), error);
    const code = parseInt(getErrorName(error)) || 500;
    return {
      statusCode: code,
      error: new Error("CSV export failed."),
    };
  }
};

const getAttendances: eventHandler = async (event) => {
  const { id, jwtData, date, startDate, endDate } = event.payload as PayloadWithIdDataDate;
  try {
    let attendancesInDB = null;
    if (id == null) {
      if (date == null) {
        if (startDate == null || endDate == null) {
          attendancesInDB = await queryGetAllAttendances();
        } else {
          attendancesInDB = await queryGetAttendanceByStartEndDay(startDate.toDateString(), endDate.toDateString());
        }
      } else {
        attendancesInDB = await queryGetAttendanceByDay(date.toDateString());
      }
    } else {
      attendancesInDB = await queryGetAttendanceByUserId(id);
    }
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
  const { id, jwtData } = event.payload as PayloadWithIdData;
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
        jwtData: jwtData,
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
  exportAttendanceToCSV, 
  getAttendances,
  updateAttendance,
  deleteAttendances
};
