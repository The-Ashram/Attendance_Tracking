import { relations } from 'drizzle-orm';
import {
    text,
    timestamp,
    pgTable,
    uuid,
    pgEnum,
    varchar
} from 'drizzle-orm/pg-core';
import { events } from './events.schema';
import { attendance } from './attendance.schema';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const rolesEnum = pgEnum(
    'Roles',
    ['admin', 'user']
);

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    role: rolesEnum('role').notNull(),
    email: text('email').notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
});

export const usersRelations = relations(events, ({ many }) => ({
    attendance: many(attendance)
}));

export const usersSchema = createInsertSchema(users, {
    email: (schema) => schema.email.min(1, {message: 'Email must be provided!'}),
    password: (schema) => schema.password.min(1, {message: 'Password must be provided!'}),
    name: (schema) => schema.password.min(1, {message: 'Name must be provided!'}),
}).pick({
    id: true,
    name: true,
    role: true,
    email: true,
    password: true,
    createdAt: true,
}); 
export type UsersSchema = z.infer<typeof usersSchema>;