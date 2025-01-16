
import { user } from "../../../db/schema/user.js";
import { vehicle } from "../../../db/schema/vehicle.js";
import { favorite } from "../../../db/schema/favorite.js";
import { database } from "../../../db/db.js";
import { successResponse, errorResponse } from "../../utils/response.handle.js";
import { eq, and } from "drizzle-orm";

const addVehicleToFavorite = async (req, res) => {
    try {
        const { vehicle_id } = req.body;
        const vehicleExists = await database.query.vehicle.findFirst({
            where: eq(vehicle.id, vehicle_id)  
        });
        if (!vehicleExists) {
            return errorResponse(res, "Vehicle not found", 404);
        }
        if (vehicleExists.host_id == req.loggedInUserId) {
            return errorResponse(res, "You can't add your own vehicle to favorites.", 400);
        }
        const favoriteExists = await database.query.favorite.findFirst({
            where: and(eq(favorite.user_id,req.loggedInUserId),eq(favorite.vehicle_id,vehicle_id))
        });
        if (favoriteExists) {
            return errorResponse(res, "Vehicle is already in favorites", 400);
        }

        await database.transaction(async (transaction) => {
            const data = await transaction
                .insert(favorite)
                .values({
                    vehicle_id,
                    user_id: req.loggedInUserId
                })
                .returning();
            return successResponse(res, "Vehicle added to favorites", data);

        })
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};


const removeVehicleFromFavorite = async (req, res) => {
    try {
        const { favoriteId } = req.params;

        const favoriteExists = await database.query.favorite.findFirst({
            where: eq(favorite.id,favoriteId)
        });

        if (!favoriteExists) {
            return errorResponse(res, "Vehicle not found in favorites", 404);
        }

        await database.transaction(async (transaction) => {
            const data  = await transaction.delete(favorite)
            .where(eq(favorite.id, favoriteId))
                .returning();
                return successResponse(
                    res,
                    "Vehicle removed from favorites",
                    { data }
                );
        })
        
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

const getFavoriteVehicles = async (req, res) => {
    try {
        const favorites = await database.query.favorite.findMany({
            where: eq(favorite.user_id, req.loggedInUserId),
            with: {
                vehicle: {
                    with: {
                        reviews: {
                            with: {
                                reviewer: {
                                    with: {
                                        role: true
                                    }
                                }
                            }
                        },
                        host: {
                            with: {
                                role: true
                            }
                        }
                    }
                }
            }
        });

        // Calculate average rating for each vehicle
        const favoriteVehiclesWithRating = favorites.map(favorite => {
            const vehicle = favorite.vehicle;
            const reviews = vehicle.reviews;

            // Calculate the average rating
            const totalReviews = reviews.length;
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

            // Add average rating to the vehicle object
            return {
                ...favorite,
                vehicle: {
                    ...vehicle,
                    averageRating: averageRating.toFixed(1),
                }
            };
        });

        return successResponse(res, "Favorites fetched successfully", favoriteVehiclesWithRating);
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};


export {
    addVehicleToFavorite,
    removeVehicleFromFavorite,
    getFavoriteVehicles
}