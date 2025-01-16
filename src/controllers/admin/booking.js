import { booking } from "../../../db/schema/booking.js";
import { database } from "../../../db/db.js";
import { eq, and, count, gte, lte } from "drizzle-orm";
import { successResponse, errorResponse } from "../../utils/response.handle.js";


const filterBookings = async (req, res) =>
{
    try {
        let { hostId, renterId, status, start_date, end_date, page = 1, limit = 10 } = req.query;
        const bookingConditions = [];
        if (hostId) bookingConditions.push(eq(booking.host_id, hostId));
        if (renterId) bookingConditions.push(eq(booking.renter_id, renterId));
        if (status) bookingConditions.push(eq(booking.status, status));

        // Handle date range for bookings
        if (start_date && end_date) {
            const startDate = new Date(start_date);
            const endDate = new Date(end_date);
            bookingConditions.push(
                and(
                    gte(booking.start_date, startDate),
                    lte(booking.end_date, endDate)
                )
            );
        }

        const offset = (Number(page) - 1) * Number(limit);

        // Fetch filtered bookings with pagination
        const filteredBookings = await database.query.booking.findMany({
            where: and(...bookingConditions),
            limit: Number(limit),
            offset,
            with: {
                renter: true,
                host: true,
                vehicle: true
            }
        });

        const totalCount = await database
            .select({ count: count() })
            .from(booking)
            .where(and(...bookingConditions));

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

        return successResponse(res, "Bookings fetched successfully!", {
            bookings: filteredBookings,
            totalCount: totalCount[0].count,
            nextPageUrl,
        });

    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

const deleteBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const bookingData = await database.query.booking.findFirst({
            where:eq(booking.id,bookingId)
        })
  
        if (!bookingData) {
          return errorResponse(res, "Booking not found", 404);
        }
        if (bookingData.status !== 'completed' || bookingData.status !== 'cancel') {
            return errorResponse(res,"This booking is not completed or cancelled yet. So you can't delete it",400)
        }

    await database.transaction(async (transaction) => {
      const data  = await transaction.delete(booking)
      .where(eq(booking.id, bookingId))
          .returning();
          return successResponse(
              res,
              "Booking deleted successfully!",
              data
          );
  })
    
  } catch (error) {
    return errorResponse(res,error.message,500)
  }
}


export {
    filterBookings,
    deleteBooking
}