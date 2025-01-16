import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm";
import {user} from './user.js'

const userDevices = pgTable("userDevices", {
    id: uuid("id").defaultRandom().primaryKey(),
    fcm_token: varchar("fcm_token", { length: 255 }).unique().default(null),
    device_id: varchar("device_id").notNull().unique(),
    device_name: varchar("device_name").notNull(),
    user_id: uuid("user_id").references(() => user.id, { onDelete: 'cascade' }),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
})

export const userDevicesRelations = relations(userDevices, ({ one }) => ({
  user: one(user, {
    fields: [userDevices.user_id],
    references: [user.id],  
  }),
}));


export  {userDevices}
