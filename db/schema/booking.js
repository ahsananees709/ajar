import { pgEnum, pgTable, uuid, timestamp, integer, json, numeric, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./user.js";
import { vehicle } from "./vehicle.js";

const statusEnum = pgEnum("status", ['pending', 'confirmed', 'completed', 'cancel']);

const booking = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  renter_id: uuid("renter_id").references(() => user.id, { onDelete: 'cascade' }).notNull(),
  host_id: uuid("host_id").references(() => user.id, { onDelete: 'cascade' }).notNull(),
  vehicle_id: uuid("vehicle_id").references(() => vehicle.id, { onDelete: 'cascade' }).notNull(),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date").notNull(),
  total_price: numeric("total_price", { precision: 10, scale: 2 }),
  status: statusEnum('status').default('pending'),
  invoice: json("invoice").default(null),
  renter_address: json("renter_address").default(null),
  with_driver:boolean("with_driver").default(false),
  with_delivery:boolean("with_delivery").default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

const bookingRelations = relations(booking, ({ one }) => ({
  renter: one(user, {
    fields: [booking.renter_id],
    references: [user.id],
  }),
  host: one(user, {
    fields: [booking.host_id],
    references: [user.id],
    }),
  vehicle: one(vehicle, {
    fields: [booking.vehicle_id],
    references: [vehicle.id],
  }),
}));

export { booking, bookingRelations, statusEnum };
