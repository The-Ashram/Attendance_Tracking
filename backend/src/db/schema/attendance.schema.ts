import { 
    integer,
    pgEnum,
    pgTable, 
    serial,
    date, 
    uuid,
    varchar,
    timestamp
} from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { events } from "./events.schema";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const statusEnum = pgEnum(
    'attendance_status',
    ['In', 'Out']
);

export const attendance = pgTable('attendance', {
    id: serial('id').primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    eventId: integer('event_id').references(() => events.id, { onDelete: 'cascade' }),      // Nullable for daily attendance
    attendanceDate: date('attendance_date').notNull(),
    status: varchar('status', { length: 100 }).notNull(),                                   //  'Present' or 'Absent'
    reason: varchar('reason'),
    checkInVerifiedBy: varchar('check_in_verified_by'),
    checkOutVerifiedBy: varchar('check_out_verified_by'),
    returnBy: timestamp('return_by', { mode: 'string' }),
    remarks: varchar('remarks'),
    checkInTime: timestamp('check_in_time', { mode: 'string' }),
    checkOutTime: timestamp('check_out_time', { mode: 'string' }),
    createdAt: timestamp('created_at', { mode: 'string' }).default(sql.raw(`CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Singapore'`)).notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(sql.raw(`CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Singapore'`)).$onUpdate(() => sql.raw(`CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Singapore'`)).notNull(),
});

export const attendanceRelations = relations(attendance, ({ one, many }) => ({
    users: one(users, {
        fields: [attendance.userId],
        references: [users.id]
    }),
    events: one(events, {
        fields: [attendance.eventId],
        references: [events.id]
    })
}));

export const attendanceSchema = createInsertSchema(attendance, {
    userId: (schema) =>
        schema.userId.min(1, { message: "UserId must be provided!" }),
    attendanceDate: (schema) =>
        schema.attendanceDate.min(1, { message: "Attendance Date must be provided!" }),
    status: (schema) =>
        schema.status.min(2, { message: "Status must be provided!" }),
}).pick({
    id: true,
    userId: true,
    eventId: true,
    attendanceDate: true,
    status: true,
    reason: true,
    remarks: true,
    checkInVerifiedBy: true,
    checkOutVerifiedBy: true,
    returnBy: true,
    checkInTime: true,
    checkOutTime: true,
    updatedAt: true,
    createdAt: true
});
export type AttendanceSchema = z.infer<typeof attendanceSchema>