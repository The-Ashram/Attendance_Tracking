import db from "../../config/db";
import log from "../../config/log.config";
import { attendance } from "../../db/schema";
import { AttendanceSchema } from "../../db/schema/attendance.schema";
import { getErrorMessage } from "../../utils/errorHandler";
import { DatabaseRequestError } from "../../utils/errorTypes";
import { writeToString } from 'fast-csv';
import { and, gte, lte, sql } from "drizzle-orm";
import { check } from "drizzle-orm/mysql-core";

const NAMESPACE = "Attendance-Query";

export const queryCreateAttendance = async (attendanceRecord: AttendanceSchema) => {
  log.info(NAMESPACE, "Creating attendance...");
  const createdAttendance = await db
    .insert(attendance)
    .values(attendanceRecord)
    .returning()
    .catch((error) => {
      log.error(NAMESPACE, getErrorMessage(error), error);
      const e = new DatabaseRequestError("Database create attendance query error.", "501");
      throw e;
    });

  if (createdAttendance.length.valueOf() === 0) {
    log.error(
      NAMESPACE,
      "Database create attendance query failed to create attendance! Created attendance: ",
      createdAttendance
    );
    const e = new DatabaseRequestError("Attendance has not been added to database", "501");
    throw e;
  }

  return createdAttendance;
}

export const queryExportAttendancesToCSV = async () => {
  const attendances = await queryGetAllAttendances();  // Fetch all attendance records

  // Map the attendance data to an array of objects for CSV conversion
  const csvData = attendances.map(record => ({
    id: record.id,
    userId: record.userId,
    eventId: record.eventId,
    attendanceDate: record.attendanceDate,
    status: record.status,
    reason: record.reason,
    checkInVerifiedBy: record.checkInVerifiedBy,
    checkOutVerifiedBy: record.checkOutVerifiedBy,
    returnBy: record.returnBy,
    remarks: record.remarks,
    checkInTime: record.checkInTime,
    checkOutTime: record.checkOutTime,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }));

  log.info(NAMESPACE, "CSV data: ", csvData);

  // Convert JSON data to CSV format synchronously
  const csvString = await writeToString(csvData, { headers: true });
  log.info(NAMESPACE, "CSV string: ", csvString);
  return csvString;
};


export const queryGetAllAttendances = async () => {
  const attendances = await db
    .select()
    .from(attendance)
    .catch((error) => {
      log.error(NAMESPACE, getErrorMessage(error), error);
      const e = new DatabaseRequestError("Database query error.", "501");
      throw e;
    });

  if (attendances.length.valueOf() === 0) {
    log.error(
      NAMESPACE,
      "Database get all attendances query failed to retrieve attendance(s)! Attendances array retrieved: ",
      attendances
    );
    const e = new DatabaseRequestError("Attendances do not exist!", "404");
    throw e;
  }

  return attendances;
}

export const queryGetAttendanceById = async (attendanceId: string) => {
  const attendanceRecord = await db
    .select()
    .from(attendance)
    .where(sql`${attendance.id} = ${attendanceId}`)
    .limit(1)
    .catch((error) => {
      log.error(NAMESPACE, getErrorMessage(error), error);
      const e = new DatabaseRequestError("Database query error.", "501");
      throw e;
    });

  if (attendanceRecord.length.valueOf() === 0) {
    log.error(
      NAMESPACE,
      `Database get attendance by id query failed to retrieve for attendance id ${attendanceId}! Attendance retrieved: `,
      attendanceRecord
    );
    const e = new DatabaseRequestError("Attendance does not exist!", "404");
    throw e;
  }

  return attendanceRecord;
};

export const queryGetAttendanceByUserId = async (userId: string) => {
  const attendanceRecord = await db
    .select()
    .from(attendance)
    .where(sql`${attendance.userId} = ${userId}`)
    .catch((error) => {
      log.error(NAMESPACE, getErrorMessage(error), error);
      const e = new DatabaseRequestError("Database query error.", "501");
      throw e;
    });

  if (attendanceRecord.length.valueOf() === 0) {
    log.error(
      NAMESPACE,
      `Database get attendance by user id query failed to retrieve attendance for user ${userId}! Attendance retrieved: `,
      attendanceRecord
    );
    const e = new DatabaseRequestError("Attendance does not exist!", "404");
    throw e;
  }

  return attendanceRecord;
};

export const queryGetAttendanceByDay = async (date: string) => {
  const attendanceRecord = await db
    .select()
    .from(attendance)
    .where(sql`${attendance.attendanceDate} = ${date}`)
    .catch((error) => {
      log.error(NAMESPACE, getErrorMessage(error), error);
      const e = new DatabaseRequestError("Database query error.", "501");
      throw e;
    });

  if (attendanceRecord.length.valueOf() === 0) {
    log.error(
      NAMESPACE,
      `Database get attendance by date query failed to retrieve attendance for date ${date}! Attendance retrieved: `,
      attendanceRecord
    );
    const e = new DatabaseRequestError("Attendance does not exist!", "404");
    throw e;
  }

  return attendanceRecord;
};

export const queryGetAttendanceByStartEndDay = async (startDate: string, endDate: string) => {
  const attendanceRecord = await db
    .select()
    .from(attendance)
    .where(and(gte(attendance.attendanceDate, startDate), lte(attendance.attendanceDate, endDate)))
    .catch((error) => {
      log.error(NAMESPACE, getErrorMessage(error), error);
      const e = new DatabaseRequestError("Database query error.", "501");
      throw e;
    });

  if (attendanceRecord.length.valueOf() === 0) {
    log.error(
      NAMESPACE,
      `Database get attendance by start and end date query failed to retrieve attendance for start date ${startDate} and end date ${endDate}! Attendance retrieved: `,
      attendanceRecord
    );
    const e = new DatabaseRequestError("Attendance does not exist!", "404");
    throw e;
  }

  return attendanceRecord;
}

export const queryUpdateAttendance = async ( 
  id: string, 
  attendanceRecord: Partial<AttendanceSchema>
) => {
  const updatedAttendance = await db
    .update(attendance)
    .set(attendanceRecord)
    .where(sql`${attendance.id} = ${id}`)
    .returning({
      id: attendance.id,
      userId: attendance.userId,
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime,
      eventId: attendance.eventId,
      attendanceDate: attendance.attendanceDate,
      status: attendance.status,
      reason: attendance.reason,
      checkInVerifiedBy: attendance.checkInVerifiedBy,
      checkOutVerifiedBy: attendance.checkOutVerifiedBy,
      returnBy: attendance.returnBy,
      remarks: attendance.remarks,
      updatedAt: attendance.updatedAt
    })
    .catch((error) => {
      log.error(NAMESPACE, getErrorMessage(error), error);
      const e = new DatabaseRequestError("Database update attendance query error.", "501");
      throw e;
    });

  if (updatedAttendance.length.valueOf() === 0) {
    log.error(
      NAMESPACE,
      `Database update attendance query failed to update for attendance record ${id}! Updated attendance: `,
      updatedAttendance
    );
    const e = new DatabaseRequestError("Attendance has not been updated", "404");
    throw e;
  }

  log.info(NAMESPACE, "Updated attendance checkout time: ", updatedAttendance[0].updatedAt);

  return updatedAttendance;
}

export const queryDeleteAttendance = async (id: string) => {
  const deletedAttendance = await db
    .delete(attendance)
    .where(sql`${attendance.id} = ${id}`)
    .returning()
    .catch((error) => {
      log.error(NAMESPACE, getErrorMessage(error), error);
      const e = new DatabaseRequestError("Database delete attendance query error.", "501");
      throw e;
    });

  if (deletedAttendance.length.valueOf() === 0) {
    log.error(
      NAMESPACE,
      `Database delete attendance query failed to delete for attendance record ${id}! Deleted attendance: `,
      deletedAttendance
    );
    const e = new DatabaseRequestError("Attendance has not been deleted", "404");
    throw e;
  }

  return deletedAttendance;
}


export const queryDeleteAllAttendances = async () => {
  const deletedAttendances = await db
    .delete(attendance)
    .returning()
    .catch((error) => {
      log.error(NAMESPACE, getErrorMessage(error), error);
      const e = new DatabaseRequestError("Database delete all attendances query error.", "501");
      throw e;
    });

  if (deletedAttendances.length.valueOf() === 0) {
    log.error(
      NAMESPACE,
      `Database delete all attendances query failed! Deleted attendances: `,
      deletedAttendances
    );
    const e = new DatabaseRequestError("Attendances not found", "404");
    throw e;
  }

  return deletedAttendances;
}