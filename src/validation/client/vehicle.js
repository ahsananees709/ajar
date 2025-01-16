import { z } from 'zod';

const createVehicleSchema = z.object({
    body: z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        full_address: z.string(),
        vin_number: z.string().length(17),
        make: z.string(),
        model: z.string(),
        year: z.number().min(1886).max(new Date().getFullYear()),
        vehicle_type: z.enum(['Cars', 'SUVs', 'Minivans', 'Box Trucks', 'Trucks', 'Vans', 'Cargo Vans']),
        color: z.string(),
        reason_for_hosting: z.string(),
        start_date: z.string()
            .refine((date) => !isNaN(Date.parse(date)), { message: "Invalid start_date format" })
            .refine((date) => new Date(date) >= new Date(), { message: "start_date must be today or in the future" }),
        end_date: z.string()
            .refine((date) => !isNaN(Date.parse(date)), { message: "Invalid end_date format" })
            .refine((date) => new Date(date) > new Date(), { message: "end_date must be today or in the future" }),
        transmission_type: z.enum(['Auto', 'Manual']),
        fuel_type: z.enum(['Gasoline', 'Diesel', 'Electric', 'Hybrid']),
        price: z.number().min(0, "Price is required"),
        city: z.string().min(1, "City is required"),
        mileage: z.number().min(0),
        seats: z.number().min(1),
        engine_size: z.string(),
        registration_number: z.string(),
        license_plate: z.string(),
        is_available: z.boolean().optional(),
        delivery_available: z.boolean().optional(),
        description: z.string().optional(),
        driver_availability: z.enum(['Only with driver', 'Driver available on Demand', 'Without Driver']),
    })
});

const updateVehicleSchema = z.object({
    params: z.object({
        id: z.string().uuid()
    }),
    body: z.object({
        latitude: z.number().min(-90).max(90).optional(),
        longitude: z.number().min(-180).max(180).optional(),
        full_address: z.string().optional(),
        vin_number: z.string().length(17).optional(),
        make: z.string().optional(),
        model: z.string().optional(),
        year: z.number().min(1886).max(new Date().getFullYear()).optional(),
        vehicle_type: z.enum(['Cars', 'SUVs', 'Minivans', 'Box Trucks', 'Trucks', 'Vans', 'Cargo Vans']).optional(),
        color: z.string().optional(),
        reason_for_hosting: z.string().optional(),
        start_date: z.string()
            .refine((date) => !isNaN(Date.parse(date)), { message: "Invalid start_date format" })
            .refine((date) => new Date(date) >= new Date(), { message: "start_date must be today or in the future" }).optional(),
        end_date: z.string()
            .refine((date) => !isNaN(Date.parse(date)), { message: "Invalid end_date format" })
            .refine((date) => new Date(date) > new Date(), { message: "end_date must be today or in the future" }).optional(),
        transmission_type: z.enum(['Auto', 'Manual']).optional(),
        fuel_type: z.enum(['Gasoline', 'Diesel', 'Electric', 'Hybrid']).optional(),
        mileage: z.number().min(0).optional(),
        seats: z.number().min(1).optional(),
        engine_size: z.string().optional(),
        price: z.number().min(0).optional(),
        city: z.string().min(1).optional(),
        registration_number: z.string().optional(),
        license_plate: z.string().optional(),
        is_available: z.boolean().optional(),
        description: z.string().optional(),
        driver_availability: z.enum(['Only with driver', 'Driver available on Demand', 'Without Driver']).optional(),
    })
});


const getVehiclesByHostSchema = z.object({
    params: z.object({
        hostId: z.string().uuid()
    })
});

export {
    createVehicleSchema,
    updateVehicleSchema,
    getVehiclesByHostSchema
};
