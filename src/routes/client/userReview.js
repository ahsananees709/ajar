import express from "express";
import { createUserReview, updateUserReview, deleteUserReview, getUserReviews } from '../../controllers/client/userReview.js';
import { getUserReviewsSchema, createUserReviewSchema, updateUserReviewSchema, deleteUserReviewSchema } from "../../validation/client/userReview.js";
import { validationMiddleware } from "../../middlewares/validation_schema.js";
import { authentication } from "../../middlewares/auth_middlewares.js";

const router = express.Router()

router.post(
    '/',
    authentication,
    validationMiddleware(createUserReviewSchema,req=>req.body),
    createUserReview
);

router.patch(
    '/:review_id',
    authentication,
    validationMiddleware(updateUserReviewSchema,req=>req.body),
    updateUserReview
);

router.delete(
    '/:review_id',
    authentication,
    validationMiddleware(deleteUserReviewSchema,req=>req.params),
    deleteUserReview
);

router.get(
    '/:user_id',
    // authentication,
    validationMiddleware(getUserReviewsSchema,req=>req.params),
    getUserReviews
);

export default router