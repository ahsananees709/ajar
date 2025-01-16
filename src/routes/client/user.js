import express from "express";
import {
  registerUser, verifyAccount, getNewOTP, loginUser, updatePassword,
  resetPassword, completeProfile, me, profilePicture, logOut, refreshToken,
  verifyOTP, switchRole,
  licenseDetails, upsertFcmToken
 } from "../../controllers/client/user.js";
import { validationMiddleware } from "../../middlewares/validation_schema.js";
import {
  authentication,authorization, checkUserAlreadyRegistered, checkUserIsAvailableAndVerified,} from "../../middlewares/auth_middlewares.js";
import {
  registerUserValidationSchema, verifyAccountValidationSchema, getNewOTPValidationSchema,
  loginUserValidationSchema, updatePasswordValidationSchema, resetPasswordValidationSchema,
  completeProfileValidationSchema, updateUserValidationSchema, verifyOTPValidationSchema,
  licenseDetailsValidationSchema
} from "../../validation/client/user.js";
import { uploadProfilePictureMiddleware } from "../../middlewares/images_middlewares.js";


const router = express.Router()

router.put(
  "/upsert-fcm-token",
  authentication,
  upsertFcmToken
)

router.post(
    "/register",
    validationMiddleware(registerUserValidationSchema, req => req.body),
    checkUserAlreadyRegistered,
    registerUser
)

router.post(
    "/verify",
  validationMiddleware(verifyAccountValidationSchema, req => req.body),
  // checkUserIsAvailableAndVerified,
  verifyAccount,
  )

  router.get(
    "/new-otp/:email",
    validationMiddleware(getNewOTPValidationSchema, req => req.params),
    getNewOTP,
)

router.post(
  "/verify-otp",
validationMiddleware(verifyOTPValidationSchema, req => req.body),
checkUserIsAvailableAndVerified,
verifyOTP,
)
  
router.post(
  "/login",
  validationMiddleware(loginUserValidationSchema, req => req.body),
  checkUserIsAvailableAndVerified,
  loginUser,
)

router.post(
  "/update-password",
  validationMiddleware(updatePasswordValidationSchema, req => req.body),
  authentication,
  updatePassword,
)

router.post(
  "/reset-password",
  checkUserIsAvailableAndVerified,
  validationMiddleware(resetPasswordValidationSchema, req => req.body),
  resetPassword,
) 

router.patch(
  "/complete-profile",
  validationMiddleware(completeProfileValidationSchema, req => req.body),
  authentication,
  completeProfile,
)

router
  .route("/me")
  .get(authentication, me)
  .patch(
    authentication,
    validationMiddleware(updateUserValidationSchema, req => req.body),
    me,
)

router.patch(
  "/profile-picture",
  authentication,
  uploadProfilePictureMiddleware,
  profilePicture
)

router.post(
  "/logout",
  authentication,
  logOut
)

router.post('/refresh-token',
  refreshToken
)

router.patch(
  "/switch-role",
  authentication,
  switchRole
)

router.patch(
  "/license-details",
  validationMiddleware(licenseDetailsValidationSchema, req => req.body),
  authentication,
  licenseDetails,
)

export default router
