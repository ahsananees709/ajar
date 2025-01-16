import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./user.js"; 
import { permission } from "./permission.js";
import { rolePermission } from "./rolePermissions.js";  

const role = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title").notNull().unique(),
});


export const roleRelations = relations(role, ({ many }) => ({
  users: many(user),  
  rolePermissions: many(rolePermission, {
    fields: [role.id], 
    references: [rolePermission.role_id],  
  }),
}));

export { role };
