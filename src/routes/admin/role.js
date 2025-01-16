import express from "express";
import { createRole, updateRole, getRoles, deleteRole } from "../../controllers/admin/role.js";
import { validationMiddleware } from "../../middlewares/validation_schema.js";
import { createRoleValidationSchema, updateRoleValidationSchema } from "../../validation/admin/role.js";
import {
  authentication,authorization, checkUserAlreadyRegistered, checkUserIsAvailableAndVerified,} from "../../middlewares/auth_middlewares.js";
import { PERMISSIONS } from "../../utils/constant.js";



const router = express.Router()

router.post(
    "/create",
    validationMiddleware(createRoleValidationSchema, req => req.body),
    // authentication,
    // authorization([PERMISSIONS.MANAGE_ROLES]),
    createRole
)

router.patch(
  "/update/:roleId",
  validationMiddleware(updateRoleValidationSchema, req => req.body),
  authentication,
  authorization([PERMISSIONS.MANAGE_ROLES]),
  updateRole
)

router.delete(
    "/delete/:roleId",
  authentication,
  authorization([PERMISSIONS.MANAGE_ROLES]),
  deleteRole
)

router.get(
    "/",
    // authentication,
    // authorization([PERMISSIONS.MANAGE_ROLES]),
    getRoles
)


  export default router
