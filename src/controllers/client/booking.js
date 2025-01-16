import { eq, and, or, ne, gte, lte } from "drizzle-orm"
import { booking } from "../../../db/schema/booking.js"
import { database } from "../../../db/db.js"
import { user } from "../../../db/schema/user.js"
import { successResponse,errorResponse } from "../../utils/response.handle.js"
import { vehicle } from "../../../db/schema/vehicle.js"

const calculateTotalPrice = (startDate, endDate, vehicleData, with_driver, with_delivery, distance_for_delivery) => {
    // Convert start and end date to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate the time difference in days
    const timeDifference = end - start;
    const daysDifference = timeDifference / (1000 * 60 * 60 * 24); // Milliseconds to days

    // Initialize cost breakdown
    const vehicleCost = vehicleData.price * daysDifference;
    let driverCost = 0;
    let deliveryCost = 0;

    // Calculate driver cost if driver is available or required
    if (
        vehicleData.driver_availability === 'Only with driver' ||
        (vehicleData.driver_availability === 'Driver available on Demand' && with_driver)
    ) {
        driverCost = vehicleData.driver_price * daysDifference;
    }

    // Calculate delivery cost if delivery is available
    if (vehicleData.delivery_available && with_delivery) {
        deliveryCost = vehicleData.delivery_price * distance_for_delivery;
    }

    // Calculate total cost
    const totalCost = vehicleCost + driverCost + deliveryCost;

    // Return an object with detailed breakdown
    return {
        invoice: {
            startDate,
            endDate,
            days: daysDifference,
            vehicle: {
                unit_price: vehicleData.price,
                total: vehicleCost,
                calculation: `${vehicleData.price} * ${daysDifference} days`
            },
            driver: {
                unit_price: vehicleData.driver_price,
                total: driverCost,
                calculation: `${vehicleData.driver_price} * ${daysDifference} days`
            },
            delivery: {
                unit_price: vehicleData.delivery_price,
                total: deliveryCost,
                calculation: `${vehicleData.delivery_price} * ${distance_for_delivery} kms`
            },
            totalCost
        }
    };
};

const createBooking = async (req, res) => {
    try {
        const { vehicle_id, start_date, end_date, with_driver, with_delivery, distance_for_delivery, renter_address } = req.body;
        // Check if the vehicle belongs to the logged-in user
        const isMyOwnVehicle = await database.query.vehicle.findFirst({
            where: and(eq(vehicle.id, vehicle_id), eq(vehicle.host_id, req.loggedInUser))
        });
        if (isMyOwnVehicle) {
            return errorResponse(res, "Not Allowed! You can't book your own vehicle.", 400);
        }

        // Fetch vehicle data
        const vehicleData = await database.query.vehicle.findFirst({
            where: eq(vehicle.id, vehicle_id)
        });
        if (!vehicleData) return errorResponse(res, "This vehicle is not available.", 400);
        
        // Check if the user has completed the profile
        const loggedInUser = await database.query.user.findFirst({ where: eq(user.id, req.loggedInUserId) });
      
        if (loggedInUser.profile_completion < 100) {
            return errorResponse(res, "Not Allowed! You need to complete your profile before booking a vehicle.", 400);
        }

        if (!renter_address && with_delivery) {
              return errorResponse(res,"You need to provide delivery address",400)
        }

        if (with_delivery && !distance_for_delivery)
        {
            return errorResponse(res,"You need to provide distance between host and delivery location",400)
        }
        
        // Check if requested booking falls within the vehicle's available dates
        const requestedStartDate = new Date(start_date);
        const requestedEndDate = new Date(end_date);
        const vehicleAvailableStartDate = new Date(vehicleData.start_date);
        const vehicleAvailableEndDate = new Date(vehicleData.end_date);

     
        if (
            requestedStartDate < vehicleAvailableStartDate || 
            requestedEndDate > vehicleAvailableEndDate         
        ) {
            return errorResponse(res, "The vehicle is not available for the selected dates.", 400);
        }
        // Check vehicle availability for the selected start_date and end_date
        const existingBooking = await database.query.booking.findFirst({
            where: and(
                eq(booking.vehicle_id, vehicle_id),
                or(
                    // Start date falls within an existing booking
                    and(gte(booking.start_date, new Date(start_date)), lte(booking.start_date, new Date(end_date))),
                    // End date falls within an existing booking
                    and(gte(booking.end_date, new Date(start_date)), lte(booking.end_date, new Date(end_date))),
                    // Booking fully overlaps existing booking
                    and(lte(booking.start_date, new Date(start_date)), gte(booking.end_date, new Date(end_date)))
                )
            )
        });
        if (existingBooking) {
            return errorResponse(res, "Vehicle is not available for the selected dates.", 400);
        }


        const invoice = calculateTotalPrice(start_date, end_date, vehicleData, with_driver, with_delivery, distance_for_delivery);
        await database.transaction(async (transaction) => {
            const data = await transaction
                .insert(booking)
                .values({
                    renter_id: req.loggedInUserId,
                    host_id: vehicleData.host_id,
                    vehicle_id,
                    start_date: new Date(start_date),
                    end_date: new Date(end_date),
                    total_price: invoice.invoice.totalCost,
                    renter_address,
                    invoice,
                    with_delivery,
                    with_driver
                })
                .returning();

            return successResponse(res, "Booking created successfully!", {
                booking: data
            });
        });

    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

const updateBooking = async (req, res) => {
    try {
        const { booking_id } = req.params; 
        const { start_date, end_date, with_driver, with_delivery, distance_for_delivery, renter_address } = req.body;

        // Fetch the existing booking
        const existingBooking = await database.query.booking.findFirst({
            where: eq(booking.id, booking_id)
        });

        if (!existingBooking) {
            return errorResponse(res, "Booking not found.", 404);
        }

        // Check if booking is still in "pending" status
        if (existingBooking.status !== 'pending') {
            return errorResponse(res, "Booking cannot be updated because it's accepted/rejected or cancel.", 400);
        }

        // Fetch vehicle data to check availability
        const vehicleData = await database.query.vehicle.findFirst({
            where: eq(vehicle.id, existingBooking.vehicle_id)
        });

        if (!vehicleData) {
            return errorResponse(res, "The vehicle associated with this booking is not available.", 400);
        }

        // Convert input dates and vehicle availability dates to Date objects
        const requestedStartDate = new Date(start_date);
        const requestedEndDate = new Date(end_date);
        const vehicleAvailableStartDate = new Date(vehicleData.start_date);
        const vehicleAvailableEndDate = new Date(vehicleData.end_date);

        // Check if requested dates fall within the vehicle's availability
        if (requestedStartDate < vehicleAvailableStartDate || requestedEndDate > vehicleAvailableEndDate) {
            return errorResponse(res, "The vehicle is not available for the updated dates.", 400);
        }

        // Check for overlapping bookings
        const overlappingBooking = await database.query.booking.findFirst({
            where: and(
                eq(booking.vehicle_id, vehicleData.id),
                ne(booking.id, booking_id),  // Exclude current booking from conflict check
                or(
                    and(
                        lte(booking.start_date, requestedEndDate),   // An existing booking starts before or on the requested end date
                        gte(booking.end_date, requestedStartDate)    // An existing booking ends after or on the requested start date
                    )
                )
            )
        });

        if (overlappingBooking) {
            return errorResponse(res, "Vehicle is already booked for the selected dates.", 400);
        }

        const invoice = calculateTotalPrice(start_date, end_date, vehicleData, with_driver, with_delivery, distance_for_delivery);

        // Perform the update in a transaction
        await database.transaction(async (transaction) => {
            const updatedBooking = await transaction
                .update(booking)
                .set({
                    start_date: requestedStartDate,
                    end_date: requestedEndDate,
                    total_price: invoice.invoice.totalCost,
                    with_driver,
                    with_delivery,
                    invoice,
                    renter_address: with_delivery ? renter_address : null
                })
                .where(eq(booking.id, booking_id))
                .returning();

            return successResponse(res, "Booking updated successfully!", {
                updatedBooking
            });
        });

    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

const getMyBookings = async (req, res) => {
    try {
        // Fetch user data along with role
        const userData = await database.query.user.findFirst({
            where: eq(user.id, req.loggedInUserId),
            with: { role: true }
        });

        // Check if user data exists
        if (!userData) {
            return errorResponse(res, 'User not found', 404);
        }

        let bookings = [];
        
        // If the user is a "Renter", fetch only their bookings as a renter
        if (userData.role.title === 'Renter') {
            bookings = await database.query.booking.findMany({
                where: eq(booking.renter_id, req.loggedInUserId),
                with: {
                    vehicle: true
                }
            });

            if (!bookings.length) {
                return successResponse(res, 'No bookings found for this user.', bookings);
            }

            return successResponse(res, 'Bookings data fetched successfully', { renterBookings: bookings });
        }

        // If the user is a "Host" or any other role, fetch both host and renter bookings
        bookings = await database.query.booking.findMany({
            where: or(
                eq(booking.host_id, req.loggedInUserId),
                eq(booking.renter_id, req.loggedInUserId)
            ),
            with: {
                vehicle: true
            }
        });

        if (!bookings.length) {
            return successResponse(res, 'No bookings found for this user.', { hostBookings: [], renterBookings: [] });
        }

        // Separate host bookings and renter bookings
        const hostBookings = bookings.filter(item => item.host_id == req.loggedInUserId);
        const renterBookings = bookings.filter(item => item.renter_id == req.loggedInUserId);

        return successResponse(res, 'Bookings fetched successfully!', {
            hostBookings,
            renterBookings
        });

    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

const getBookingById = async (req, res) => {
    try {
        const { bookingId } = req.params
        const data = await database.query.booking.findFirst({
            where: eq(booking.id, bookingId),
            with: {
                vehicle:true
            }
        })
        return successResponse(res,"Data Fetched Successfully!",data)
    } catch (error) {
        return errorResponse(res,error.message,500)
    }
}

// const cancelOrder = async (req, res) => {
//     try {
//         const order_id = req.params.order_id
//         const { cancellation_reason } = req.body
//         const isOrder = await database.query.order.findFirst({ where: and(eq(order.customer_id, req.loggedInUserId), eq(order.id, order_id)) });
//         if (!isOrder)
//             return errorResponse(res, "Not Allowed! This order is not available.", 400)
        
//         if (isOrder.order_status === "cancelled" || isOrder.order_status === "completed") {
//             return errorResponse(res, "Not Allowed! Because order is already completed or cancelled", 400)
//         }
//         // Update the Order
//         const data = await database
//             .update(order)
//             .set({
//                 cancellation_reason,
//                 order_status: "cancelled",
//                 payment_status:"failed"
//             })
//             .where(eq(order.id, order_id))
//             .returning()
        
//         return successResponse(res, "Order cancelled successfully!", data);
//     } catch (error) {
//         return errorResponse(res, error.message, 500);
//     }
// }

const acceptorRejectorCompleteOrder = async (req, res) => {
    try {
        const order_id = req.params.order_id
        const { order_status } = req.body
        const isOrder = await database.query.order.findFirst({ where: and(eq(order.service_provider_id, req.loggedInUserId), eq(order.id, order_id)) });
        if (!isOrder)
            return errorResponse(res, "Not Allowed! This order is not available or not belongs to you.", 400)
        
        if (isOrder.order_status === "cancelled" && order_status === "cancelled") {
            return errorResponse(res, "Not Allowed! Because order is already cancelled.", 400)
        }
        if (isOrder.order_status === "completed" && order_status === "completed") {
            return errorResponse(res, "Not Allowed! Because order is already completed.", 400)
        }
        if (isOrder.order_status === "processing" && order_status === "processing") {
            return errorResponse(res, "Not Allowed! Because order is already accepted and in processing.", 400)
        }
        if (isOrder.order_status === "completed" && order_status === "cancelled") {
            return errorResponse(res, "Not Allowed! Because order is already completed.", 400)
        }
        if (isOrder.order_status === "completed" && order_status === "processing") {
            return errorResponse(res, "Not Allowed! Because order is already completed.", 400)
        }
        if (order_status === "cancelled")
        {
            const data = await database
            .update(order)
            .set({
                order_status: order_status,
                payment_status:"failed"
            })
            .where(eq(order.id, order_id))
            .returning()
        
        return successResponse(res, `Order ${order_status} successfully!`, data);
            }
        if (order_status === "completed")
        {
            const data = await database
            .update(order)
            .set({
                order_status: order_status,
                payment_status:"paid"
            })
            .where(eq(order.id, order_id))
            .returning()
        
        return successResponse(res, `Order ${order_status} successfully!`, data);
            }
        const data = await database
            .update(order)
            .set({
                order_status: order_status,
                payment_status:"pending"
            })
            .where(eq(order.id, order_id))
            .returning()
        
        return successResponse(res, `Order ${order_status} successfully!`, data);
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
}





export {
    createBooking,
    updateBooking,
    getMyBookings,
    getBookingById
    // updateOrder,
    // cancelOrder,
    // acceptorRejectorCompleteOrder,
    // getMyOrders
}