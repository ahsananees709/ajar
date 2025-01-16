import { pgTable, uuid, varchar, integer, timestamp } from 'drizzle-orm/pg-core';
import { relations } from "drizzle-orm";
import { user } from './user.js';

const userReview = pgTable('user_reviews', {
    id: uuid('id').defaultRandom().primaryKey(),
    reviewer_id: uuid('reviewer_id').references(() => user.id, { onDelete: 'cascade' }),
    reviewed_user_id: uuid('reviewed_user_id').references(() => user.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(),
    review: varchar('review', { length: 500 }).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
});

const userReviewRelations = relations(userReview, ({ one }) => ({
    reviewer: one(user, {
        fields: [userReview.reviewer_id],
        references: [user.id], 
    }),
    reviewedUser: one(user, {
        fields: [userReview.reviewed_user_id],
        references: [user.id], 
    })
}));

export {
    userReview,
    userReviewRelations
  }