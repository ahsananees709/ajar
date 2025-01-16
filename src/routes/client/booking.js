import express from 'express';
import { validateRequest } from 'zod-express-middleware';

const router = express.Router();

import { createBooking, updateBooking, getMyBookings, getBookingById } from '../../controllers/client/booking.js';
import { createBookingSchema, updateBookingSchema } from '../../validation/client/booking.js';
import { authentication, authorization } from "../../middlewares/auth_middlewares.js";


router.post (
    '/',
    authentication,
    validateRequest(createBookingSchema),
    createBooking
);

router.get (
    '/',
    authentication,
    getMyBookings
);
router.get (
    '/:bookingId',
    getBookingById
);

router.patch (
    '/:booking_id',
    authentication,
    validateRequest(updateBookingSchema),
    updateBooking
);

export default router;
