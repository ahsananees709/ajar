import express from "express";
import { deleteBooking, filterBookings } from "../../controllers/admin/booking.js";
import { validationMiddleware } from "../../middlewares/validation_schema.js";
// import { createRoleValidationSchema, updateRoleValidationSchema } from "../../validation/admin/role.js";
import {
  authentication,authorization, checkUserAlreadyRegistered, checkUserIsAvailableAndVerified,} from "../../middlewares/auth_middlewares.js";
import { PERMISSIONS } from "../../utils/constant.js";



const router = express.Router()

router.get(
  "/",
//   validationMiddleware(updateRoleValidationSchema, req => req.body),
  authentication,
//   authorization([PERMISSIONS.MANAGE_ROLES]),
  filterBookings
)

router.delete(
    "/:bookingId",
  //   validationMiddleware(updateRoleValidationSchema, req => req.body),
    authentication,
  //   authorization([PERMISSIONS.MANAGE_ROLES]),
    deleteBooking
  )

// router.delete(
//   "/:vehicleId",
//   authentication,
//   deleteVehicle
// )

export default router
