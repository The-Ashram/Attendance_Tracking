import { relations } from "drizzle-orm";
import {
  text,
  timestamp,
  pgTable,
  uuid,
  pgEnum,
  varchar,
  integer,
} from "drizzle-orm/pg-core";
import { events } from "./events.schema";
import { attendance } from "./attendance.schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const rolesEnum = pgEnum("Roles", ["admin", "user", "resident"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  role: rolesEnum("role").notNull(),
  email: text("email").notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 255 }).notNull(),
  phaseNumber: integer("phase_number"),
  employeeID: varchar("employee_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(events, ({ many }) => ({
  attendance: many(attendance),
}));

export const usersSchema = createInsertSchema(users, {
  email: (schema) =>
    schema.email.min(1, { message: "Email must be provided!" }),
  password: (schema) =>
    schema.password.min(8, { message: "Password must be provided! It has to be at least 8 characters long!" }),
  name: (schema) =>
    schema.password.min(1, { message: "Name must be provided!" }),
  phoneNumber: (schema) =>
    schema.password.min(8, { message: "PhoneNumber must be provided!" }),
}).pick({
  id: true,
  name: true,
  role: true,
  email: true,
  password: true,
  phoneNumber: true,
  phaseNumber: true,
  employeeID: true,
  createdAt: true,
  updatedAt: true
});
export type UsersSchema = z.infer<typeof usersSchema>;
