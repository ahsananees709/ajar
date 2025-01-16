import { z } from 'zod';

const createVehicleReviewSchema = z.object({
  vehicle_id: z.string().uuid(),
  review: z.string().min(1, "Review cannot be empty"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
});

const updateVehicleReviewSchema = z.object({
  review: z.string().min(1, "Review cannot be empty").optional(),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5").optional(),
});

const deleteVehicleReviewSchema = z.object({
  review_id: z.string().uuid(),
});

const getVehicleReviewsSchema = z.object({
    vehicle_id: z.string().uuid(),
  });

export {
  createVehicleReviewSchema,
  updateVehicleReviewSchema,
  deleteVehicleReviewSchema,
  getVehicleReviewsSchema
};
