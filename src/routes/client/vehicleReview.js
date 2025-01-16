import express from 'express';
import { validationMiddleware } from '../../middlewares/validation_schema.js';
import { authentication } from '../../middlewares/auth_middlewares.js';
import {
    getVehicleReviewsSchema,
  createVehicleReviewSchema,
  updateVehicleReviewSchema,
  deleteVehicleReviewSchema
} from '../../validation/client/vehicleReview.js';
import {
    getVehicleReviews,
  createVehicleReview,
  updateVehicleReview,
  deleteVehicleReview
} from '../../controllers/client/vehicleReview.js'; 
const router = express.Router();

router.post(
    '/', 
  authentication,
  validationMiddleware(createVehicleReviewSchema, req=>req.body),
  createVehicleReview
);

router.patch(
  '/:id', 
  authentication,
  validationMiddleware(updateVehicleReviewSchema, req=>req.body), 
  updateVehicleReview
);

router.delete(
  '/:review_id', 
  authentication,
  validationMiddleware(deleteVehicleReviewSchema, req=>req.params),
  deleteVehicleReview
);

router.get(
    '/:vehicle_id',
    validationMiddleware(getVehicleReviewsSchema, req=>req.params),
    getVehicleReviews,
)
export default router;
