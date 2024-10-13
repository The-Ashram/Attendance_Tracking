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
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const statusEnum = pgEnum(
    'attendance_status',
    ['In', 'Out']
);

export const attendance = pgTable('attendance', {
    id: serial('id').primaryKey(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    eventId: integer('event_id').references(() => events.id),                               // Nullable for daily attendance
    attendanceDate: date('attendance_date').notNull(),
    status: varchar('status', { length: 100 }).notNull(),                                   //  'Present' or 'Absent'
    reason: varchar('reason'),
    verifiedBy: varchar('verified_by'),
    remarks: varchar('remarks'),
    checkInTime: timestamp('check_in_time'),
    checkOutTime: timestamp('check_out_time'),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
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

export const attendanceSchema = createInsertSchema(attendance);
export type AttendanceSchema = z.infer<typeof attendanceSchema>