import express from "express";
import {
    createPermission, updatePermission, getPermissions, deletePermission,
    assignPermissionToRole, getPermissionsForRole, removePermissionFromRole
 } from "../../controllers/admin/permission.js";
import { validationMiddleware } from "../../middlewares/validation_schema.js";
import {
    createPermissionValidationSchema, updatePermissionValidationSchema,
    assignPermissionToRoleValidationSchema,
    getPermissionsForRoleValidationSchema,
    removePermissionFromRoleValidationSchema
 } from "../../validation/admin/permission.js";
import {
  authentication,authorization} from "../../middlewares/auth_middlewares.js";
import { PERMISSIONS } from "../../utils/constant.js";


const router = express.Router()

router.post(
    "/create",
    validationMiddleware(createPermissionValidationSchema, req => req.body),
    authentication,
    authorization([PERMISSIONS.MANAGE_PERMISSIONS]),
    createPermission
)

router.patch(
  "/update/:permissionId",
  validationMiddleware(updatePermissionValidationSchema, req => req.body),
  authentication,
  authorization([PERMISSIONS.MANAGE_PERMISSIONS]),
  updatePermission
)

router.delete(
    "/delete/:permissionId",
  authentication,
  authorization([PERMISSIONS.MANAGE_PERMISSIONS]),
  deletePermission
)

router.get(
    "/list",
    // authentication,
    // authorization([PERMISSIONS.MANAGE_PERMISSIONS]),
    getPermissions
)

router.post(
    '/assign',
    validationMiddleware(assignPermissionToRoleValidationSchema,req => req.body),
    // authentication,
    // authorization([PERMISSIONS.MANAGE_PERMISSIONS]),
    assignPermissionToRole
)

router.get(
    '/:roleId',
    validationMiddleware(getPermissionsForRoleValidationSchema,req => req.params),
    authentication,
    authorization([PERMISSIONS.MANAGE_PERMISSIONS]),
    getPermissionsForRole
)

router.delete(
    '/remove',
    validationMiddleware(removePermissionFromRoleValidationSchema,req => req.body),
    // authentication,
    // authorization([PERMISSIONS.MANAGE_PERMISSIONS]),
    removePermissionFromRole
)


  export default router
