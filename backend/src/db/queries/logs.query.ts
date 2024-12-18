import { and, gte, lte, sql } from "drizzle-orm";
import db from "../../config/db";
import log from "../../config/log.config";
import { DatabaseRequestError } from "../../utils/errorTypes";
import { logs, LogsSchema } from "../schema/logs.schema";

const NAMESPACE = "Logs-Query";

export const queryCreateLog = async (logRecord: LogsSchema) => {
  log.info(NAMESPACE, "Creating log...");
  const createdLog = await db
  .insert(logs)
  .values(logRecord)
  .returning()
  .catch((error) => {
    log.error(NAMESPACE, "Error creating log:", error);
    const e = new DatabaseRequestError("Database create log query error.", "501");
    throw e;
  })

  if (createdLog.length.valueOf() === 0) {
    log.error(NAMESPACE, "Database create log query failed to create log! Created log: ", createdLog);
    const e = new DatabaseRequestError("Log has not been added to database", "501");
    throw e;
  }

  log.info(NAMESPACE, "Log created successfully");
  return createdLog;
};

export const queryGetAllLogs = async () => {
  const logsRecord = await db
  .select()
  .from(logs)
  .catch((error) => {
    log.error(NAMESPACE, "Error getting logs:", error);
    const e = new DatabaseRequestError("Database get logs query error.", "501");
    throw e;
  });

  if (logsRecord.length.valueOf() === 0) {
    log.error(NAMESPACE, "Database get logs query failed to retrieve logs! Logs retrieved: ", logsRecord);
    const e = new DatabaseRequestError("Logs do not exist!", "404");
    throw e;
  };

  return logsRecord;
};

export const queryGetLogsByStartEndDay = async (startDay: string, endDay: string) => {
  const logsRecord = await db
  .select()
  .from(logs)
  .where(and(gte(logs.createdAt, startDay), lte(logs.createdAt, endDay)))
  .catch((error) => {
    log.error(NAMESPACE, "Error getting logs:", error);
    const e = new DatabaseRequestError("Database get logs query error.", "501");
    throw e;
  });

  if (logsRecord.length.valueOf() === 0) {
    log.error(NAMESPACE, "Database get logs query failed to retrieve logs! Logs retrieved: ", logsRecord);
    const e = new DatabaseRequestError("Logs do not exist!", "404");
    throw e;
  };

  return logsRecord;
};

export const queryGetLogsByDay = async (date: string) => {
  const logsRecord = await db
  .select()
  .from(logs)
  .where(sql`${logs.createdAt} = ${date}`)
  .catch((error) => {
    log.error(NAMESPACE, "Error getting logs:", error);
    const e = new DatabaseRequestError("Database get logs query error.", "501");
    throw e;
  });

  if (logsRecord.length.valueOf() === 0) {
    log.error(NAMESPACE, "Database get logs query failed to retrieve logs! Logs retrieved: ", logsRecord);
    const e = new DatabaseRequestError("Logs do not exist!", "404");
    throw e;
  };

  return logsRecord;
};