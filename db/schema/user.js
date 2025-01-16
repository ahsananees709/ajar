import { pgEnum, pgTable, uuid, varchar, boolean, json, timestamp, numeric } from "drizzle-orm/pg-core"
import { role } from "./role.js"
import { vehicle } from "./vehicle.js"
import { relations } from "drizzle-orm"
import { booking } from "./booking.js"
import { favorite } from "./favorite.js"
import { userReview } from "./userReview.js"
import { userDevices } from "./userDevices.js"

const genderEnum = pgEnum("gender", ["male", "female", "other"])

const user = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email").notNull().unique(),
  phone: varchar("phone", { length: 255 }),
  password: varchar("password").notNull(),
  first_name: varchar("first_name").notNull(),
  last_name: varchar("last_name"),
  gender: genderEnum("gender"),
  otp: varchar("otp", { length: 6 }),
  profile_picture: varchar("profile_picture", { length: 255 }),
  cnic: varchar("cnic", { length: 255 }),
  address: json("address"),
  is_admin: boolean("is_admin").default(false),
  is_verified: boolean("is_verified").default(false),
  online: boolean("online").default(false),
  activeConversation: uuid("activeConversation").default(null),
  role_id: uuid("role_id").references(() => role.id, { onDelete: 'SET NULL' }),
  driving_license_details: json("driving_license_details"),
  profile_completion: numeric("profile_completion", { precision: 5, scale: 2 }).default(0),
  // fcm_token: varchar("fcm_token", { length: 255 }).default(null),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
})

export const userRelations = relations(user, ({ one, many }) => ({
  role: one(role, {
    fields: [user.role_id], 
    references: [role.id],   
  }),
  vehicles: many(vehicle),
  bookings: many(booking),
  favorites: many(favorite),
  reviewsGiven: many(userReview),
  reviewsReceived: many(userReview),
  userDevices: many(userDevices)
}));


export  {user,genderEnum}
