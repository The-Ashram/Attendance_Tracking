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
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

export const eventsRelations = relations(events, ({ many }) => ({
    attendance: many(attendance)
}));

export const eventsSchema = createInsertSchema(events, {
    title: (schema) => schema.title.min(1, {message: 'Title must be provided!'}),
    location: (schema) => schema.location.min(1, {message: 'Location must be provided!'}),
    startDate: (schema) => schema.startDate.min(1, {message: 'StartDate must be provided!'}),
    endDate: (schema) => schema.endDate.min(1, {message: 'EndDate must be provided!'}),
    startTime: (schema) => schema.startTime.min(1, {message: 'StartTime must be provided!'}),
    endTime: (schema) => schema.endTime.min(1, {message: 'EndTime must be provided!'}),
}).pick({
    id: true,
    startDate: true,
    endDate: true,
    endTime: true,
    title: true,
    location: true,
}); 
export type EvemtsSchema = z.infer<typeof eventsSchema>;