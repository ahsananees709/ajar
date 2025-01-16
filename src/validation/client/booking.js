import { z } from 'zod';

const createBookingSchema = z.object({
    body: z.object({
        vehicle_id: z.string().uuid(),
        start_date: z.string()
        .refine((date) => !isNaN(Date.parse(date)), { message: "Invalid start_date format" })
        .refine((date) => new Date(date) >= new Date(), { message: "start_date must be today or in the future" }),
        end_date: z.string()
        .refine((date) => !isNaN(Date.parse(date)), { message: "Invalid end_date format" })
        .refine((date) => new Date(date) >= new Date(), { message: "end_date must be today or in the future" }),
        with_driver: z.boolean().optional(),
        with_delivery: z.boolean().optional(),
        distance_for_delivery: z.number().optional(),
        renter_address: z.string().optional()
    })
});

const updateBookingSchema = z.object({
    params: z.object({
        booking_id: z.string().uuid()
    }),
    body: z.object({
        start_date: z.string()
        .refine((date) => !isNaN(Date.parse(date)), { message: "Invalid start_date format" })
        .refine((date) => new Date(date) >= new Date(), { message: "start_date must be today or in the future" }).optional(),
        end_date: z.string()
        .refine((date) => !isNaN(Date.parse(date)), { message: "Invalid end_date format" })
        .refine((date) => new Date(date) >= new Date(), { message: "end_date must be today or in the future" }).optional(),
        with_driver: z.boolean().optional(),
        with_delivery: z.boolean().optional(),
        distance_for_delivery: z.number().optional(),
        renter_address: z.string().optional()
    })
});


export {
    createBookingSchema,
    updateBookingSchema
}

