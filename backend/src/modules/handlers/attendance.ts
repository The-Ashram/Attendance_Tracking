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
  queryGetAttendanceByStartEndDay,
  queryGetAttendanceByUserId,
  queryUpdateAttendance,
} from "../../db/queries/attendance.query";
import { PayloadWithDataCreateBody, PayloadWithIdData, PayloadWithIdDataDate, PayloadWithIdUpdate } from "../interfaces/attendance.interfaces";
import { createObjectCsvStringifier } from "csv-writer";
import { queryGetUserByAttendanceRecords, queryGetUserById } from "../../db/queries/users.query";
import { LogsSchema } from "../../db/schema/logs.schema";
import { queryCreateLog } from "../../db/queries/logs.query";

const NAMESPACE = "Attendance-Handler";

const parseDateTime = (dateTime: Date) => {
  const isoString = dateTime.toISOString(); // Convert to ISO string
  const [date, timeWithMs] = isoString.split("T"); // Split into date and time
  const time = timeWithMs.split(".")[0]; // Remove milliseconds from time
  return date + " " + time;
};

type event = {
  source: string;
  payload: Object;
};

type eventHandler = (event: event) => Object;

const createAttendance: eventHandler = async (event) => {
  const { createData, jwtData } = event.payload as PayloadWithDataCreateBody;

  try {

    const createdAttendance = await queryCreateAttendance(createData);
    log.info(NAMESPACE, "---------INSERTING CREATE ATTENDANCE LOG---------");
    // Get name of admin
    const adminUser = await queryGetUserById(jwtData.id);
    const attendanceChanges = `User ID: ${createdAttendance[0].userId}
Event ID: ${createdAttendance[0].eventId}
Status: ${createdAttendance[0].status}
Reason: ${createdAttendance[0].reason}
Remarks: ${createdAttendance[0].remarks}
Check In Time: ${createdAttendance[0].checkInTime}
Check In Verified By: ${createdAttendance[0].checkInVerifiedBy}
Check Out Time: ${createdAttendance[0].checkOutTime}
Check Out Verified By: ${createdAttendance[0].checkOutVerifiedBy}
Return By: ${createdAttendance[0].returnBy}`;
    const logRecord: LogsSchema = {
      tableName: "attendance",
      recordId: createdAttendance[0].id.toString(),
      actionType: "CREATE",
      changes: attendanceChanges,
      createdBy: adminUser[0].name
    }
    const logRecordInDB = await queryCreateLog(logRecord);
    log.info(NAMESPACE, "Inserted log: ", logRecordInDB);
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

    // Join the matching name column from userRecords to the recordsInDB array
    const combinedRecordsInDB = recordsInDB.map((record) => {
      const matchingUserRecord = userRecords.find((userRecord) => userRecord.id === record.userId);
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
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
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
      error: new Error("CSV export attendance failed."),
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
    const oldAttendance = await queryGetAttendanceById(id);
    const updatedAttendance = await queryUpdateAttendance(id, updateData);
    log.info(NAMESPACE, "---------INSERTING UPDATE ATTENDANCE LOG---------");
    // Get name of admin
    const adminUser = await queryGetUserById(jwtData.id);
    
    const updatedRecord = `Before:
  User ID: ${oldAttendance[0].userId}
  Event ID: ${oldAttendance[0].eventId}
  Status: ${oldAttendance[0].status}
  Reason: ${oldAttendance[0].reason}
  Remarks: ${oldAttendance[0].remarks}
  Check In Time: ${oldAttendance[0].checkInTime}
  Check In Verified By: ${oldAttendance[0].checkInVerifiedBy}
  Check Out Time: ${oldAttendance[0].checkOutTime}
  Check Out Verified By: ${oldAttendance[0].checkOutVerifiedBy}
  Return By: ${oldAttendance[0].returnBy}
  Created At: ${oldAttendance[0].createdAt}
  Updated At: ${oldAttendance[0].updatedAt}
After:
  User ID: ${updatedAttendance[0].userId}
  Event ID: ${updatedAttendance[0].eventId}
  Status: ${updatedAttendance[0].status}
  Reason: ${updatedAttendance[0].reason}
  Remarks: ${updatedAttendance[0].remarks}
  Check In Time: ${updatedAttendance[0].checkInTime}
  Check In Verified By: ${updatedAttendance[0].checkInVerifiedBy}
  Check Out Time: ${updatedAttendance[0].checkOutTime}
  Check Out Verified By: ${updatedAttendance[0].checkOutVerifiedBy}
  Return By: ${updatedAttendance[0].returnBy}
  Updated At: ${updatedAttendance[0].updatedAt}`
    const logRecord: LogsSchema = {
      tableName: "attendance",
      recordId: id.toString(),
      actionType: "UPDATE",
      changes: updatedRecord,
      createdBy: adminUser[0].name
    }
    const logRecordInDB = await queryCreateLog(logRecord);
    log.info(NAMESPACE, "Inserted log: ", logRecordInDB);
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
    // Get name of admin
    const adminUser = await queryGetUserById(jwtData.id);
    log.info(NAMESPACE, "---------INSERTING DELETE ATTENDANCE LOG---------");
    const attendanceChanges = id == null
      ? deletedAttendances.map((attendance) => `ID: ${attendance.id}, User ID: ${attendance.userId}, Event ID: ${attendance.eventId}`).join("\n")
      : `ID: ${deletedAttendances[0].id}, User ID: ${deletedAttendances[0].userId}, Event ID: ${deletedAttendances[0].eventId}`;
    const logRecord: LogsSchema = {
      tableName: "attendance",
      recordId: id == null 
      ? deletedAttendances.map((attendance) => attendance.id.toString()).join(", ") 
      : id.toString(),
          actionType: "DELETE",
      changes: attendanceChanges,
      createdBy: adminUser[0].name
    }
    const logRecordInDB = await queryCreateLog(logRecord);
    log.info(NAMESPACE, "Inserted log: ", logRecordInDB);
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
