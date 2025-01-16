import { pgTable, uuid, foreignKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { role } from "./role.js"; 
import { permission } from "./permission.js"; 

const rolePermission = pgTable("role_permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  role_id: uuid("role_id").references(() => role.id,{onDelete: 'cascade'}),  
  permission_id: uuid("permission_id").references(() => permission.id, {onDelete: 'cascade'}),  
});


export const rolePermissionRelations = relations(rolePermission, ({ one }) => ({
  role: one(role, {
    fields: [rolePermission.role_id],  
    references: [role.id],  
  }),
  permission: one(permission, {
    fields: [rolePermission.permission_id], 
    references: [permission.id],  
  }),
}));

export { rolePermission };
