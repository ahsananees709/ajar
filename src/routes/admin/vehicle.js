import express from "express";
import { blockVehicle, deleteVehicle } from "../../controllers/admin/vehicle.js";
import { validationMiddleware } from "../../middlewares/validation_schema.js";
import { createRoleValidationSchema, updateRoleValidationSchema } from "../../validation/admin/role.js";
import {
  authentication,authorization, checkUserAlreadyRegistered, checkUserIsAvailableAndVerified,} from "../../middlewares/auth_middlewares.js";
import { PERMISSIONS } from "../../utils/constant.js";



const router = express.Router()

router.patch(
  "/block/:vehicleId",
//   validationMiddleware(updateRoleValidationSchema, req => req.body),
  authentication,
//   authorization([PERMISSIONS.MANAGE_ROLES]),
  blockVehicle
)

router.delete(
  "/:vehicleId",
  authentication,
  deleteVehicle
)

export default router
