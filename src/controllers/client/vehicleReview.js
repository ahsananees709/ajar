import { eq,ne, and } from "drizzle-orm"
import { vehicleReview } from "../../../db/schema/vehicleReview.js";
import { database } from "../../../db/db.js";
import { booking } from "../../../db/schema/booking.js";
import { vehicle } from "../../../db/schema/vehicle.js";
import { successResponse, errorResponse } from ".././../utils/response.handle.js"
import { calculateAverageRating } from '../../utils/helper.js'

const getVehicleReviews = async (req, res) => {
    try {
        const { vehicle_id } = req.params
        const reviews = await database.query.vehicleReview.findMany({
            where: eq(vehicleReview.vehicle_id, vehicle_id)
        })
        const averageRating = calculateAverageRating(reviews)
        return successResponse(res, 'Reviews Fetched Successfully',
            {
                reviews,
                averageRating
            }
        )
    } catch (error) {
        return errorResponse(res,error.message,500)
    }
}

const createVehicleReview = async (req, res) => {
    try {
        const user_id = req.loggedInUserId
        console.log(user_id)
        const { vehicle_id, review, rating } = req.body
        const isMyOwnVehicle = await database.query.vehicle.findFirst(
            { where: and(eq(vehicle.host_id, user_id), eq(vehicle.id, vehicle_id)) })
        if (isMyOwnVehicle) {
            return errorResponse(res,"Not Allowed! You can't add a review for your own vehicle.",400)
        }
        const alreadyAddedReview = await database.query.vehicleReview.findFirst(
            {
                where: and
                    (eq(vehicleReview.reviewer_id, user_id),
                        eq(vehicleReview.vehicle_id, vehicle_id))
            })
        if (alreadyAddedReview) {
            return errorResponse(res,"Not Allowed! You already added a review against this vehicle",400)
        }
        const isBookingNotCompleted = await database.query.booking.findFirst({where: and(eq(booking.renter_id,user_id),eq(booking.vehicle_id,vehicle_id),ne(booking.status,"completed"))})
        if (isBookingNotCompleted) {
            return errorResponse(res,"Not Allowed! This order is not completed yet.",400)
        }

        const data = await database
        .insert(vehicleReview)
        .values({
            reviewer_id:user_id,
            vehicle_id,
            review,
            rating
        })
            .returning()
        return successResponse(res,"Review Added Succesfully!",data)
    } catch (error) {
        return errorResponse(res,error.message,500)
    }
}

const updateVehicleReview = async (req, res) => {
    try {
        const { id } = req.params
        const {review, rating} = req.body
        const isMyReview = await database.query.vehicleReview.findFirst({ where: and(eq(vehicleReview.id, id), eq(vehicleReview.reviewer_id, req.loggedInUserId)) })
    
        if (!isMyReview)
        {
            return errorResponse(res,"You can't upload that review",404)
        }

        await database.transaction(async (transaction) => {
            const data = await transaction
                .update(vehicleReview)
                .set({
                    review,
                    rating
                }) 
                .where(eq(vehicleReview.id, id))
                .returning();

            return successResponse(res, "Review Updated Successfully!", data);
        });
    } catch (error) {
        return errorResponse(res,error.message,500)
    }
}

const deleteVehicleReview = async (req, res) => {
    try {
        const review_id = req.params.review_id
        const check = await database.query.vehicleReview.findFirst({ where: and(eq(vehicleReview.reviewer_id, req.loggedInUserId), eq(vehicleReview.id, review_id)) })
        if (!check) {
            return errorResponse(res,"No review found.",404)
        }
        await database.transaction(async (transaction) => {
            const data = await transaction
                .delete(vehicleReview)
                .where(eq(vehicleReview.id, review_id))
                .returning()
            
                return successResponse(res,"Review Deleted Succesfully!",data)
        })
        
    } catch (error) {
        return errorResponse(res,error.message,500)
    }
}


export {
    getVehicleReviews,
    createVehicleReview,
    deleteVehicleReview,
    updateVehicleReview
}