import { relations } from "drizzle-orm";
import { 
    date, 
    pgTable, 
    serial, 
    text, 
    time, 
    varchar 
} from "drizzle-orm/pg-core";
import { attendance } from "./attendance.schema";

export const events = pgTable('events', {
    id: serial('id').primaryKey(),
    title: varchar('title').notNull().unique(),
    description: text('description'),
    location: varchar('location').notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    startTime: time('start_time').notNull(),
    endTime: time('end_time').notNull(),
});

export const eventsRelations = relations(events, ({ one, many }) => ({
    attendance: many(attendance)
}));