import { z } from 'zod';

const addFavoriteVehicleSchema = z.object({
    vehicle_id: z.string().uuid()
});

const removeFavoriteVehicleSchema = z.object({
    favoriteId: z.string().uuid()
});

export {
    addFavoriteVehicleSchema,
    removeFavoriteVehicleSchema
};
