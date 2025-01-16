import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { rolePermission } from "./rolePermissions.js";  // Import role_permissions for relation

const permission = pgTable("permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title").notNull().unique(),
});


export const permissionRelations = relations(permission, ({ many }) => ({
  rolePermissions: many(rolePermission),
}));

export { permission }