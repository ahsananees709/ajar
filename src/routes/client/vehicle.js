import express from 'express';
import {
    createVehicle, getAllVehicles, getVehicleById, updateVehicle, deleteVehicle,
    uploadVehiclePictures, getVehiclesByHost, filterVehicles
} from '../../controllers/client/vehicle.js';

import { validationMiddleware } from "../../middlewares/validation_schema.js";
import { createVehicleSchema, updateVehicleSchema, getVehiclesByHostSchema } from '../../validation/client/vehicle.js';
import { uploadVehiclePicturesMiddleware } from '../../middlewares/images_middlewares.js';
import { authentication, authorization } from '../../middlewares/auth_middlewares.js';
import { PERMISSIONS } from '../../utils/constant.js';
import { createBooking } from '../../controllers/client/booking.js';
import { validateRequest } from 'zod-express-middleware';

const router = express.Router();



router.post('/',
    authentication,
    authorization([PERMISSIONS.CREATE_VEHICLE]),
    validateRequest(createVehicleSchema),
    createVehicle)
router.get('/',
    authentication,
    authorization([PERMISSIONS.VIEW_VEHICLES]),
    getAllVehicles) 
router.get('/filter',
        filterVehicles
);   
// router.get('/search',
//     // authentication,  // Optional: if authentication is required
//     // authorization([PERMISSIONS.VIEW_VEHICLES]),  // Optional: if authorization is required
//     searchVehicles
// );                               
router.get('/:id',
    authentication,
    authorization([PERMISSIONS.VIEW_VEHICLES]),
    getVehicleById) 
router.get('/host/:hostId',
    authentication,
    authorization([PERMISSIONS.VIEW_VEHICLES]),
    validateRequest(getVehiclesByHostSchema),
    getVehiclesByHost
    );                             
router.patch('/:id',
    authentication,
    authorization([PERMISSIONS.EDIT_VEHICLE]),
    validateRequest(updateVehicleSchema),
    updateVehicle)
router.delete('/:id',
    authentication,
    authorization([PERMISSIONS.DELETE_VEHICLE]),
    deleteVehicle)   
router.patch(
    "/pictures/:vehicleId",
    authentication,
    uploadVehiclePicturesMiddleware,
    uploadVehiclePictures
)  

router.post("/booking",
    authentication,
    createBooking
)
  

      
// return list of cars that belongs to host
//Filter APIs


export default router;
