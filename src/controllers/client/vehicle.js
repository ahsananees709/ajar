import { vehicle } from "../../../db/schema/vehicle.js";
import { successResponse, errorResponse } from "../../utils/response.handle.js";
import { database } from "../../../db/db.js";
import { eq, or, and, gte, lte } from "drizzle-orm";
import { SERVER_HOST, SERVER_PORT } from "../../utils/constant.js";
import fs from 'fs'
import { count, sql, ilike, notExists } from "drizzle-orm";
import { booking } from "../../../db/schema/booking.js";
import { calculateAverageRating } from "../../utils/helper.js";

const createVehicle = async (req, res) => {
    try {
        const {
            vin_number,
            registration_number,
            license_plate,
            latitude,
            longitude,
            full_address,
            make,
            city,
            price,
            model,
            year,
            vehicle_type,
            color,
            reason_for_hosting,
            start_date,
            end_date,
            transmission_type,
            fuel_type,
            mileage,
            seats,
            engine_size,
            description,
            driver_availability,
            driver_price,
            delivery_available,
            delivery_price,
            is_ac,
            is_gps,
            is_usb,
            is_charger,
            is_bluetooth,
            is_sunroof,
            is_push_button_start
        } = req.body
        const search_term = `${make} ${model} ${year}`;
        const isVehicleRegistered = await database.query.vehicle.findFirst({
            where: or(
                eq(vehicle.vin_number, vin_number),
                eq(vehicle.registration_number, registration_number),
                eq(vehicle.license_plate, license_plate)
            )
        });
        if (driver_availability !== 'Without Driver' && !driver_price) {
            return errorResponse(res,'You need to provide driver per day price',400)
        }
        if (delivery_available) {
            if (!delivery_price) {
                return errorResponse(res,'You need to provide delivery price per hour',400)
            }
        }

        if (isVehicleRegistered) {
            return errorResponse(res, "This vehicle is already registered.", 400);
        }
        await database.transaction(async(transaction) => {
            const data = await transaction.insert(vehicle)
            .values({
                host_id: req.loggedInUserId,
                vin_number,
                registration_number,
                license_plate,
                latitude,
                longitude,
                full_address,
                make,
                city,
                price,
                model,
                year,
                vehicle_type,
                color,
                reason_for_hosting,
                search_term,
                start_date: new Date(start_date),
                end_date:new Date(end_date),
                transmission_type,
                fuel_type,
                mileage,
                seats,
                engine_size,
                description,
                driver_price,
                delivery_available,
                delivery_price,
                is_ac,
                is_gps,
                is_usb,
                is_charger,
                is_bluetooth,
                is_sunroof,
                is_push_button_start,
                driver_availability })
            .returning();

        return successResponse(res, "Vehicle created successfully", data);
})
        
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

const getAllVehicles = async (req, res) => {
    try {
        const data = await database.query.vehicle.findMany()
        return successResponse(res,"Vehicles list fetched successfully!",data)
    } catch (error) {
        return errorResponse(res,error.message,500)
    }
}

const getVehicleById = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) {
            return errorResponse(res,"Vehicle Id is required",400)
        }
        const data = await database.query.vehicle.findFirst({ where: eq(vehicle.id, id) })
        if (!data)
        {
            return errorResponse(res,"Vehicle not found!",data)
        }
        return successResponse(res,"Vehicle data fetched successfully!",data)
    } catch (error) {
        return errorResponse(res,error.message,500)
    }
}

const updateVehicle = async (req, res) => {
    try {
        const {
            vin_number,
            registration_number,
            license_plate,
            latitude,
            longitude,
            full_address,
            make,
            city,
            price,
            model,
            year,
            vehicle_type,
            color,
            reason_for_hosting,
            start_date,
            end_date,
            transmission_type,
            fuel_type,
            mileage,
            seats,
            engine_size,
            description,
            driver_availability,
            driver_price,
            delivery_available,
            delivery_price,
            is_available,
            is_ac,
            is_gps,
            is_usb,
            is_charger,
            is_bluetooth,
            is_sunroof,
            is_push_button_start
        } = req.body

        const { id } = req.params
        if (!id) {
            return errorResponse(res,"Vehicle Id is required",400)
        }
        const vehicleData = await database.query.vehicle.findFirst({ where: eq(vehicle.id, id) })
        if (!vehicleData)
        {
            return errorResponse(res,"Vehicle not found!",404)
        }
        if (req.loggedInUserId != vehicleData.host_id)
        {
            return errorResponse(res,"This vehicle not belongs to you, so you can't update this vehicle!",400)
        }
        if (driver_availability !== 'Without Driver' && driver_price<=0) {
            return errorResponse(res,'You need to provide driver per day price',400)
        }
        if (delivery_available) {
            if (!delivery_price) {
                return errorResponse(res,'You need to provide delivery price per hour',400)
            }
        }

        let search_term = vehicleData.search_term;

        if (make !== vehicleData.make || model !== vehicleData.model || year !== vehicleData.year) {
            // Update makeModelYear field if make, model, or year has changed
            search_term = `${make || vehicleData.make} ${model || vehicleData.model} ${year || vehicleData.year}`;
        }

            const updateValues = {
                vin_number,
                registration_number,
                license_plate,
                latitude,
                longitude,
                full_address,
                make,
                city,
                price,
                model,
                year,
                vehicle_type,
                color,
                reason_for_hosting,
                transmission_type,
                fuel_type,
                mileage,
                seats,
                engine_size,
                description,
                driver_availability,
                is_available,
                driver_price,
                delivery_available,
                delivery_price,
                is_ac,
                is_gps,
                is_usb,
                is_charger,
                is_bluetooth,
                is_sunroof,
                is_push_button_start,
                search_term,
                updated_at: new Date(),
            };

            if (start_date) {
                updateValues.start_date = new Date(start_date);
            }
            if (end_date) {
                updateValues.end_date = new Date(end_date);
            }
    
            // Start the database transaction
            await database.transaction(async (transaction) => {
                const data = await transaction
                    .update(vehicle)
                    .set(updateValues) 
                    .where(eq(vehicle.id, id))
                    .returning();
    
                return successResponse(res, "Vehicle Updated Successfully!", data);
            });

    } catch (error) {
        return errorResponse(res,error.message,500)
    }
}

const deleteVehicle = async (req, res) => {
    try {
        const {id} = req.params
        const vehicleData = await database.query.vehicle.findFirst({ where: eq(vehicle.id, id) })
        if (!vehicleData)
        {
            return errorResponse(res,"Vehicle not found!",404)
        }
        if (req.loggedInUserId != vehicleData.host_id)
        {
            return errorResponse(res,"This vehicle not belongs to you, so you can't update this vehicle!",400)
        }
        await database.transaction(async (transaction) => {
            const data  = await transaction.delete(vehicle)
            .where(eq(vehicle.id, id))
                .returning();
                return successResponse(
                    res,
                    "Vehicle deleted successfully!",
                    { data }
                );
        })
        
    } catch (error) {
        return errorResponse(res,error.message,500)
    }
}

const uploadVehiclePictures = async (req, res) => {
    try {
        const picturePaths = req.files.map(file => file.path);
        if (picturePaths.length <= 0) {
            return errorResponse(res, "No pictures uploaded.", 400);
        }

        // Retrieve the existing vehicle record by the vehicle ID passed in the request
        const vehicleId = req.params.vehicleId;
        console.log(vehicleId);
        const currentVehicle = await database.query.vehicle.findFirst({
            where: eq(vehicle.id, vehicleId),
            columns: {
                pictures: true,
            },
        });

        // Combine existing pictures with new ones if there are any
        const combinedPictures = currentVehicle && currentVehicle.pictures 
            ? [...currentVehicle.pictures, ...picturePaths] 
            : picturePaths;

        // Update the vehicle with the combined picture paths
        const updatedVehicle = await database
            .update(vehicle)
            .set({ pictures: combinedPictures, updated_at: new Date() })
            .where(eq(vehicle.id, vehicleId))
            .returning();

        // Convert the picture paths to accessible URLs for the response
        const updatedPictureUrls = updatedVehicle[0].pictures.map(picture =>
            `${picture.replace(/^public/, "").replace(/\\/g, "/")}`
        );

        const data = await database
            .update(vehicle)
            .set({ pictures: updatedPictureUrls })
            .where(eq(vehicle.id, vehicleId))
            .returning();

        // Send a success response
        return successResponse(res, "Vehicle pictures uploaded successfully!", {
            data
        });
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

const getVehiclesByHost = async (req, res) => {
    try {
        const { hostId } = req.params
        if (!hostId)
            {
                return errorResponse(res,"Host Id is required!",400)
            }
        const data = await database.query.vehicle.findMany({ where: eq(vehicle.host_id, hostId) })
        return successResponse(res, "Vehicles List Fetched Successfully!", data)
    } catch (error) {
        return errorResponse(res,error.message,500)
    }
}
const filterVehicles = async (req, res) => {
    try {
        let { vehicleId, hostId, price, vehicle_type, make, year, model, city, seats, fuel_type, start_date, end_date, is_available, page = 1, limit = 10 } = req.query;
        if (is_available) {
            if (is_available === 'Blocked')
            {
                is_available = 'false'
            }
            else {
                is_available = 'true'
            }
        }
        // Array to store conditions for filtering vehicles
        const vehicleConditions = [];
        if (vehicleId) vehicleConditions.push(eq(vehicle.id, vehicleId));
        if (hostId) vehicleConditions.push(eq(vehicle.host_id, hostId));
        if (price) vehicleConditions.push(lte(vehicle.price, Number(price)));
        if (vehicle_type) vehicleConditions.push(eq(vehicle.vehicle_type, vehicle_type));
        if (make) vehicleConditions.push(eq(vehicle.make, make));
        if (year) vehicleConditions.push(eq(vehicle.year, Number(year)));
        if (model) vehicleConditions.push(eq(vehicle.model, model));
        if (city) vehicleConditions.push(eq(vehicle.city, city));
        if (seats) vehicleConditions.push(lte(vehicle.seats, Number(seats)));
        if (fuel_type) vehicleConditions.push(eq(vehicle.fuel_type, fuel_type));
        if (is_available) vehicleConditions.push(eq(vehicle.is_available, is_available));

        // Pagination logic
        const offset = (Number(page) - 1) * Number(limit);

        // Fetch filtered vehicles with pagination
        const filteredVehicles = await database.query.vehicle.findMany({
            where: and(...vehicleConditions),
            limit: Number(limit),
            offset,
            // with: {
            //     host: {
            //         with: {
            //             role:true
            //         }
            //     }
            // }
            with: {
                reviews: {
                    with: {
                        reviewer: {
                            with: {
                                role:true
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
        });
        const availableVehicles = filteredVehicles.map(vehicle => {
            const reviews = vehicle.reviews;

            // If the vehicle has reviews, calculate the average rating
            if (reviews && reviews.length > 0) {
                const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
                const averageRating = totalRating / reviews.length;
                vehicle.averageRating = averageRating.toFixed(1); // Round to 1 decimal
            } else {
                vehicle.averageRating = null; // No reviews, no rating
            }

            return vehicle;
        });
  

        if (start_date && end_date) {
            const startDate = new Date(start_date);
            const endDate = new Date(end_date);

            // Get vehicle IDs from the filtered vehicles
            const vehicleIds = availableVehicles.map(vehicle => vehicle.id);

            // Fetch bookings for the filtered vehicles
            const bookings = await database.query.booking.findMany({
                where: and(
                    eq(booking.status, "completed"), // Optionally filter by status if needed
                    or(...vehicleIds.map(id => eq(booking.vehicle_id, id))) // Filter by vehicle IDs
                )
            });

            // Filter out vehicles that have bookings overlapping the provided dates
            availableVehicles = availableVehicles.filter(vehicle => {
                return !bookings.some(booking => {
                    const bookingStart = new Date(booking.start_date);
                    const bookingEnd = new Date(booking.end_date);
                    return (
                        (bookingStart < endDate && bookingEnd > startDate) // Check for overlap
                    );
                });
            });
        }

        // Get total count of vehicles under the applied filters (without pagination)
        const totalCount = await database
            .select({ count: count() })
            .from(vehicle)
            .where(and(...vehicleConditions));

        // Calculate next page URL
        const nextPage = Number(page) + 1;
        const totalPages = Math.ceil(Number(totalCount[0].count) / Number(limit));
        let nextPageUrl = null;

        if (nextPage <= totalPages) {
            const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}/filter`;
            const queryString = new URLSearchParams({
                ...req.query,
                page: nextPage
            }).toString();
            nextPageUrl = `${baseUrl}?${queryString}`;
        }

        return successResponse(res, "Vehicles fetched successfully", {
            vehicles: availableVehicles,
            totalCount: totalCount[0].count,
            nextPageUrl,
        });

    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};



// const filterVehicles = async (req, res) => {
//     try {
//         const { vehicleId, hostId, price, vehicle_type, make, year, model, city, seats, fuel_type, start_date, end_date, page = 1, limit = 10 } = req.query;
//         // Array to store conditions for filtering
//         const conditions = [];
//         if (vehicleId) conditions.push(eq(vehicle.id, vehicleId));
//         if (hostId) conditions.push(eq(vehicle.host_id, hostId));
//         if (price) conditions.push(lte(vehicle.price, Number(price)));
//         if (vehicle_type) conditions.push(eq(vehicle.vehicle_type, vehicle_type));
//         if (make) conditions.push(eq(vehicle.make, make));
//         if (year) conditions.push(eq(vehicle.year, Number(year)));
//         if (model) conditions.push(eq(vehicle.model, model));
//         if (city) conditions.push(eq(vehicle.city, city));
//         if (seats) conditions.push(lte(vehicle.seats, Number(seats)));
//         if (fuel_type) conditions.push(eq(vehicle.fuel_type, fuel_type));

//         if (start_date && end_date) {
//             conditions.push(
//                 and(
//                     lte(vehicle.start_date, new Date(start_date)),
//                     gte(vehicle.end_date, new Date(end_date))
//                 )
//             );
//         } else if (start_date) {
//             conditions.push(gte(vehicle.start_date, new Date(start_date)));
//         } else if (end_date) {
//             conditions.push(lte(vehicle.end_date, new Date(end_date)));
//         }

//         // Pagination logic
//         const offset = (Number(page) - 1) * Number(limit);

//         // Get total count of vehicles under the applied filters
//         const totalCount = await database
//         .select({ count: count() })
//         .from(vehicle)
//         .where(and(...conditions));

//         // Fetch filtered vehicles with pagination
//         const filteredVehicles = await database.query.vehicle.findMany({
//             where: and(...conditions),
//             limit: Number(limit),
//             offset,
//             with: {
//                 host: {
//                     with: {
//                         role:true
//                     }
//                 }
//             }
//         });

//         // Calculate next page URL
//         const nextPage = Number(page) + 1;
//         const totalPages = Math.ceil(Number(totalCount[0].count) / Number(limit));
//         let nextPageUrl = null;

//         if (nextPage <= totalPages) {
//             const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}/filter`;
//             const queryString = new URLSearchParams({
//                 ...req.query,
//                 page: nextPage
//             }).toString();
//             nextPageUrl = `${baseUrl}?${queryString}`;
//         }

//         return successResponse(res, "Vehicles fetched successfully", {
//             vehicles: filteredVehicles,
//             totalCount:totalCount[0].count,
//             nextPageUrl,
//         });

//     } catch (error) {
//         return errorResponse(res, error.message, 500);
//     }
// };

// const searchVehicles = async (req, res) => {
//     try {
//         const { searchTerm, page = 1, limit = 10 } = req.query;

//         // Split the searchTerm into parts based on spaces or non-word characters
//         const searchParts = searchTerm.match(/\b\w+\b/g);

//         // Separate the year part if present (assuming the year is 4 digits)
//         const yearPart = searchParts.find(part => /^\d{4}$/.test(part));
//         const nonYearParts = searchParts.filter(part => !/^\d{4}$/.test(part));

//         // Array to hold conditions for search
//         const conditions = [];

//         // Add non-year parts (for make/model) as partial matches
//         if (nonYearParts.length > 0) {
//             nonYearParts.forEach(part => {
//                 conditions.push(ilike(vehicle.search_term, `%${part}%`));
//             });
//         }

//         // Add exact match condition for year if yearPart exists
//         if (yearPart) {
//             conditions.push(eq(vehicle.year, Number(yearPart)));
//         }

//         // Pagination logic
//         const offset = (Number(page) - 1) * Number(limit);

//         // Query to fetch the filtered vehicles
//         const filteredVehicles = await database.query.vehicle.findMany({
//             where: and(...conditions),
//             limit: Number(limit),
//             offset
//         });

//         // Get the total count of vehicles matching the search
//         const totalCount = await database.select({ count: count() })
//             .from(vehicle)
//             .where(and(...conditions));

//         // Calculate next page URL
//         const nextPage = Number(page) + 1;
//         const totalPages = Math.ceil(Number(totalCount[0].count) / Number(limit));
//         let nextPageUrl = null;

//         if (nextPage <= totalPages) {
//             const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}/search`;
//             const queryString = new URLSearchParams({
//                 ...req.query,
//                 page: nextPage
//             }).toString();
//             nextPageUrl = `${baseUrl}?${queryString}`;
//         }

//         return successResponse(res, "Vehicles fetched successfully", {
//             vehicles: filteredVehicles,
//             totalCount: totalCount[0].count,
//             nextPageUrl
//         });
//     } catch (error) {
//         return errorResponse(res, error.message, 500);
//     }
// };








  

export {
    createVehicle,
    getAllVehicles,
    getVehicleById,
    updateVehicle,
    deleteVehicle,
    uploadVehiclePictures,
    getVehiclesByHost,
    filterVehicles,
    // searchVehicles
}