import { pgTable, uuid,text,timestamp,integer } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { user } from "./user.js"


const hostReview = pgTable("host_reviews", {
    id: uuid("id").defaultRandom().primaryKey(),
    host_id: uuid("host_id").references(() => user.id, { onDelete: 'cascade' }).notNull(),
    reviewer_id: uuid("reviewer_id").references(() => user.id,{onDelete: 'cascade'}).notNull(),
    review: text("review"),
    rating: integer('rating').default(5),
    created_at: timestamp("created_at").notNull().defaultNow()
})

const hostReviewRelations = relations(hostReview, ({ one, many }) => ({
    host: one(user, {
        fields: [hostReview.host_id],
        references: [user.id],
    }),
    reviewer: one(user, {
        fields: [hostReview.reviewer_id],
        references: [user.id],
      }),
}))

export { hostReview, hostReviewRelations }
