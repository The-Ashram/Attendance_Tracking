import { DateTime } from "luxon";
import db from "../../config/db";
import log from "../../config/log.config";
import { attendance } from "../../db/schema";
import { AttendanceSchema } from "../../db/schema/attendance.schema";
import { getErrorMessage } from "../../utils/errorHandler";
import { DatabaseRequestError } from "../../utils/errorTypes";
import { sql } from "drizzle-orm";

const NAMESPACE = "Attendance-Query";

export const queryCreateAttendance = async (attendanceRecord: AttendanceSchema) => {
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
}

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
      verifiedBy: attendance.verifiedBy,
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