import express from 'express';
import {validateRequest } from 'zod-express-middleware';
import { addVehicleToFavorite, removeVehicleFromFavorite, getFavoriteVehicles } from '../../controllers/client/favorite.js';
import { addFavoriteVehicleSchema, removeFavoriteVehicleSchema } from '../../validation/client/favorite.js';
import { authentication } from '../../middlewares/auth_middlewares.js';
import { validationMiddleware } from '../../middlewares/validation_schema.js';

const router = express.Router();


router.get(
    '/',
    authentication,
    getFavoriteVehicles
);

router.post(
    '/',
    authentication,
    validationMiddleware(addFavoriteVehicleSchema,req => req.body), 
    addVehicleToFavorite
);

router.delete(
    '/:favoriteId',
    authentication,
    validationMiddleware(removeFavoriteVehicleSchema, req=> req.params),
    removeVehicleFromFavorite
);


export default router;
