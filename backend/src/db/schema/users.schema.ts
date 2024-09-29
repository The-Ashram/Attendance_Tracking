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

export const usersRelations = relations(events, ({ one, many }) => ({
    attendance: many(attendance)
}));