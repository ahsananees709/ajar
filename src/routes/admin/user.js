import express from "express";
import { authentication, authorization, checkUserAlreadyRegistered } from "../../middlewares/auth_middlewares.js";
import { filterUsers, getSingleUser, createUser, deleteUser, loginUser, updateUser, me } from "../../controllers/admin/user.js";
import { PERMISSIONS } from "../../utils/constant.js";
import { validationMiddleware } from "../../middlewares/validation_schema.js";
import { getSingleUserValidationSchema, createUserValidationSchema, updateUserValidationSchema, deleteUserValidationSchema, filterUsersValidationSchema } from "../../validation/admin/user.js";
import { loginUserValidationSchema } from "../../validation/client/user.js";

const router = express.Router()

router.post(
    "/login",
    validationMiddleware(loginUserValidationSchema, req => req.body),
    loginUser,
)
  
router
  .route("/me")
  .get(authentication, me)
  .patch(
    authentication,
    // validationMiddleware(updateUserValidationSchema, req => req.body),
    me,
)

router.get(
    "/filter",
    authentication,
    // validationMiddleware(filterUsersValidationSchema, req =>req.query),
    authorization([PERMISSIONS.MANAGE_USERS]),
    filterUsers
)
router.post(
    "/",
    authentication,
    checkUserAlreadyRegistered,
    validationMiddleware(createUserValidationSchema, req =>req.body),
    authorization([PERMISSIONS.MANAGE_USERS]),
    createUser
)
router.patch(
    "/:userId",
    authentication,
    validationMiddleware(updateUserValidationSchema, req =>req.body),
    authorization([PERMISSIONS.MANAGE_USERS]),
    updateUser
)
router.get(
    "/:userId",
    authentication,
    validationMiddleware(getSingleUserValidationSchema, req =>req.params),
    authorization([PERMISSIONS.MANAGE_USERS]),
    getSingleUser
)
router.delete(
    "/:userId",
    authentication,
    validationMiddleware(deleteUserValidationSchema, req =>req.params),
    authorization([PERMISSIONS.MANAGE_USERS]),
    deleteUser
)

export default router
