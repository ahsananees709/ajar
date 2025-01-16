import { pgTable, uuid,text,timestamp,integer } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { vehicle } from "./vehicle.js"
import { user } from "./user.js"


const vehicleReview = pgTable("vehicle_reviews", {
    id: uuid("id").defaultRandom().primaryKey(),
    reviewer_id: uuid("reviewer_id").references(() => user.id,{onDelete: 'cascade'}).notNull(),
    vehicle_id: uuid("vehicle_id").references(() => vehicle.id,{onDelete: 'cascade'}),
    review: text("review"),
    rating: integer('rating').default(5),
    created_at: timestamp("created_at").notNull().defaultNow()
})

const vehicleReviewRelations = relations(vehicleReview, ({ one, many }) => ({
    vehicle: one(vehicle, {
        fields: [vehicleReview.vehicle_id],
        references: [vehicle.id],
    }),
    reviewer: one(user, {
        fields: [vehicleReview.reviewer_id],
        references: [user.id],
      }),
}))

export { vehicleReview, vehicleReviewRelations }
