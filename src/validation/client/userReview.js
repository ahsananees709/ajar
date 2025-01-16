import { z } from 'zod';

const createUserReviewSchema = z.object({
    reviewed_user_id: z.string().uuid({ message: "Invalid user ID format" }),
    review: z.string().min(1, { message: "Review must be at least 10 characters long" }),
    rating: z.number().min(1).max(5, { message: "Rating must be between 1 and 5" }),
});

const updateUserReviewSchema = z.object({
    review: z.string().min(1, { message: "Review must be at least 10 characters long" }).optional(),
    rating: z.number().min(1).max(5, { message: "Rating must be between 1 and 5" }).optional(),
});

const deleteUserReviewSchema = z.object({
    review_id: z.string().uuid(),
});
  
const getUserReviewsSchema = z.object({
    user_id: z.string().uuid(),
});
  

export {
    createUserReviewSchema,
    updateUserReviewSchema,
    deleteUserReviewSchema,
    getUserReviewsSchema
};
