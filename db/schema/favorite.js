import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./user.js"; 
import { vehicle } from "./vehicle.js";

const favorite = pgTable("favorites", {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id").references(() => user.id, { onDelete: 'cascade' }),
    vehicle_id: uuid("vehicle_id").references(() => vehicle.id, { onDelete: 'cascade' }),
    created_at: timestamp("created_at").notNull().defaultNow(),
});

const favoriteRelations = relations(favorite, ({ one }) => ({
    user: one(user, {
        fields: [favorite.user_id],
        references: [user.id],
    }),
    vehicle: one(vehicle, {
        fields: [favorite.vehicle_id],
        references: [vehicle.id],
    }),
}));

export { favorite, favoriteRelations };
