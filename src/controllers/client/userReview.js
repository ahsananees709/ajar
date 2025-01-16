import { userReview } from "../../../db/schema/userReview.js";
import { database } from "../../../db/db.js";
import { successResponse, errorResponse} from "../../utils/response.handle.js";
import { eq, and } from "drizzle-orm";
import { calculateAverageRating } from '../../utils/helper.js'


const createUserReview = async (req, res) => {
    try {
        const { reviewed_user_id, review, rating } = req.body;
        const reviewer_id = req.loggedInUserId;
        

        if (reviewer_id === reviewed_user_id) {
            return errorResponse(res,'You cannot review yourself.',400)
        }

        const existingReview = await database.query.userReview.findFirst({
            where: eq( userReview.reviewer_id, reviewer_id )
        });

        if (existingReview) {
            return errorResponse(res,'You have already reviewed this user.',400)
        }

        await database.transaction(async (transaction) => {
        const data = await transaction
        .insert(userReview)
        .values({
            reviewer_id,
            reviewed_user_id,
            review,
            rating
        })
        .returning()
        return successResponse(res,"User review added successfully.",data)
        })
    } catch (error) {
        return errorResponse(res,error.message,500)
    }
};

const updateUserReview = async (req, res) => {
    try {
        const { review_id } = req.params;
        const { review, rating } = req.body;
        const reviewer_id = req.loggedInUserId;

        const existingReview = await database.query.userReview.findFirst({
            where: and(eq(userReview.id, review_id),eq(userReview.reviewer_id,reviewer_id))
        });

        if (!existingReview) {
            return errorResponse(res, "Review not found or you don't own this review.", 404)
        }

        await database.transaction(async (transaction) => {
            const data = await transaction
                .update(userReview)
                .set({
                    review,
                    rating
                })
                .where(eq(userReview.id, review_id))
                .returning();
            return successResponse(res, "User review updated successfully.", data)
        })

    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}

const deleteUserReview = async (req, res) => {
    try {
        const { review_id } = req.params;
        const reviewer_id = req.loggedInUserId;

        const existingReview = await database.query.userReview.findFirst({
            where: and(eq(userReview.id, review_id),eq(userReview.reviewer_id,reviewer_id))
        });

        if (!existingReview) {
            return errorResponse(res, "Review not found or you don't own this review.", 404)
        }

        await database.transaction(async (transaction) => {
            const data = await transaction
                .delete(userReview)
                .where(eq(userReview.id, review_id))
                .returning()
            
                return successResponse(res,"User review deleted successfully.",data)
        })

    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
};


const getUserReviews = async (req, res) => {
    try {
        const { user_id } = req.params;

        
        const reviews = await database.query.userReview.findMany({
            where: eq( userReview.reviewed_user_id, user_id ),
            with: {
                reviewer: true,
            }
        });
        const averageRating = calculateAverageRating(reviews)

        return successResponse(res, 'Reviews fetched successfully',
            {
                reviews,
                averageRating
            }
        )
    } catch (error) {
        return errorResponse(res,error.message,500)
    }
};

export {
    getUserReviews,
    createUserReview,
    updateUserReview,
    deleteUserReview
}