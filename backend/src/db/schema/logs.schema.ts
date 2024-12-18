import { sql } from "drizzle-orm";
import { pgTable, serial, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  tableName: text("table_name").notNull(), // e.g., "users" or "attendance"
  recordId: text("record_id").notNull(),   // ID of the modified record
  actionType: text("action_type").notNull(), // "CREATE" or "UPDATE" or "DELETE"
  changes: jsonb("changes"), // JSON object of changes
  createdBy: text("done_by").notNull(), // User who triggered the action
  createdAt: timestamp('created_at', { mode: 'string' }).default(sql.raw(`CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Singapore'`)).notNull(),
});

export const logsSchema = createInsertSchema(logs, {
  tableName: (schema) => 
    schema.tableName.min(1, { message: "Table name must be provided!" }),
  recordId: (schema) => 
    schema.recordId.min(1, { message: "Record ID must be provided!" }),
  actionType: (schema) => 
    schema.actionType.min(1, { message: "Action type must be provided!" }),
  createdBy: (schema) => 
    schema.createdBy.min(1, { message: "Created by must be provided!" })
}).pick({
  id: true,
  tableName: true,
  recordId: true,
  actionType: true,
  changes: true,
  createdBy: true,
  createdAt: true
});

export type LogsSchema = z.infer<typeof logsSchema>;
