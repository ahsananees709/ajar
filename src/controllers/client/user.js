import bcrypt from "bcrypt"
import fs from "fs"
import { user } from "../../../db/schema/user.js"
import blackListToken from "../../../db/schema/blacklisttoken.js"
import { database } from "../../../db/db.js"
import sendEmail from "../../utils/sendEmail.js";
import { registrationEmail,accountVerificationEmail, getNewOtpEmail,passwordUpdateEmail,passwordResetEmail } from "../../utils/emailTemplate.js";
import { createOTP, createJWTToken, getToken, verifyToken } from "../../utils/helper.js";
import { successResponse, errorResponse, unauthorizeResponse } from "../../utils/response.handle.js";
import { eq, and } from "drizzle-orm";
import { SERVER_HOST, SERVER_PORT, ROLES } from "../../utils/constant.js";
import { getOrCreateRole } from "../../../db/customqueries/queries.js";
import { calculateProfileCompletion } from "../../utils/helper.js"
import { userDevices } from "../../../db/schema/userDevices.js"

const upsertFcmToken = async (req, res) => {
  try {
    const { deviceId, deviceName, fcmToken } = req.body
    console.log(deviceId, deviceName, fcmToken)

    const existingDevice = await database.query.userDevices.findMany({
      where: and(eq(userDevices.user_id,req.loggedInUserId),eq(userDevices.device_id,deviceId))
    })
  
    if (existingDevice.length > 0) {
  
      await database.update(userDevices)
        .set({
          fcm_token: fcmToken,
          updated_at: new Date()
       })
      .where(and(eq(userDevices.user_id, req.loggedInUserId),eq(userDevices.device_id,deviceId)));
  
    } else {
  
      await database.transaction(async (transaction) => {
        const data = await transaction
          .insert(userDevices)
          .values({
            user_id: req.loggedInUserId,
            device_id: deviceId,
            device_name: deviceName,
            fcm_token: fcmToken,
          })
          .returning();
        return successResponse(
          res,
          "User Device Registered!",
          { data }
        );
      });
    }
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }

};

const registerUser = async (req, res) => {
  const { first_name, last_name, email, phone, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = createOTP();
  const defaultRole = await getOrCreateRole(ROLES.RENTER)
  try {
    await database.transaction(async (transaction) => {
      const response = await transaction
        .insert(user)
        .values({
          first_name,
          last_name,
          email,
          phone,
          password: hashedPassword,
          otp,
          role_id: defaultRole[0].id
        })
        .returning();
      const emailContent = registrationEmail(first_name, last_name, otp);
      await sendEmail("Registration Successful - Welcome!", emailContent, email);
      const percentage = calculateProfileCompletion(response[0])
      const data = await transaction
        .update(user)
        .set({
          profile_completion: percentage
        })
        .where(eq(user.id, response[0].id))
        .returning()
      return successResponse(
        res,
        "User Registered Successfully! An email has been sent with OTP to your provided email.",
        { data }
      );
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}

const verifyAccount = async (req, res) => {
  try {
    const { email, otp } = req.body

    const check = await database.query.user.findFirst({ where: eq(user.email, email) })
    if (!check) {
      return errorResponse(res, "User Not Found", 404)
    }
    if (check.is_verified) {
      return errorResponse(res, "User is Already Verified", 400)
    }
    if (otp !== check.otp) {
      return errorResponse(res, "Invalid OTP!", 400)
    }

    await database.transaction(async (transaction) => {
      const data = await transaction
        .update(user)
        .set({ is_verified: true, otp: null, updated_at: new Date() })
        .where(eq(user.email, email))
        .returning()
      if (data && data.length > 0) {
        const { first_name, last_name, email } = data[0];
      
        const emailContent = accountVerificationEmail(first_name, last_name, email);
        await sendEmail("User Verified - Congratulations!", emailContent, email);
      }
      return successResponse(
        res,
        "User verified successfully!",
        { data }
      );
    })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

const getNewOTP = async (req, res) => {
  try {
    const email = req.params.email
    const check = await database.query.user.findFirst({ where: eq(user.email, email) })
    if (!check) {
      return errorResponse(res, "User Not Found", 404)
    }
    const otp = createOTP()

    await database.transaction(async (transaction) => {
      const data = await transaction
        .update(user)
        .set({ otp: otp })
        .where(eq(user.email, email))
        .returning()
      
      if (data && data.length > 0) {
        const { first_name, last_name, email, otp } = data[0];
        const emailContent = getNewOtpEmail(first_name, last_name, otp);
        await sendEmail("Request for new OTP", emailContent, email);
      }
      
      return successResponse(
        res,
        "OTP sent successfully to your email address!",
        data
      );
    })

  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body

    const check = await database.query.user.findFirst({ where: eq(user.email, email) })

    if (otp !== check.otp) {
      return errorResponse(res, "Invalid OTP!", 400)
    }

    await database.transaction(async (transaction) => {
      const data = await transaction
        .update(user)
        .set({ otp: null })
        .where(eq(user.email, email))
        .returning()
      return successResponse(
        res,
        "OTP verified successfully!",
        { data }
      );
    })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    const data = await database.query.user.findFirst({
      where: eq(user.email, email),
      with: {
        role:true
      }
    })

    const isPasswordValid = await bcrypt.compare(password, data.password)

    if (!isPasswordValid) {
      return unauthorizeResponse(res, "Credentials are Wrong!")
      // return errorResponse(res,"Credentials were Wrong!",400)
    }

    const { accessToken, refreshToken } = await createJWTToken(data.id)

    return successResponse(res, "Login Successfully",
      {
        data,
        accessToken,
        refreshToken
      })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body

    const data = await database.query.user.findFirst({ where: eq(user.id, req.loggedInUserId) })

    const isMatch = await bcrypt.compare(oldPassword, data.password)

    if (!isMatch) {
      return errorResponse(res, "Old Password is incorrect!", 400)
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    await database.transaction(async (transaction) => {
      const data = await transaction
        .update(user)
        .set({ password: hashedPassword, updated_at: new Date() })
        .where(eq(user.id, req.loggedInUserId))
        .returning()
      
      if (data && data.length > 0) {
        const { first_name, last_name, email } = data[0];
      
        const emailContent = passwordUpdateEmail(first_name, last_name, email);
        await sendEmail("Password Updated", emailContent, email);
      }
      return successResponse(
        res,
        "Password Has Been Updated",
        {}
      );
    })

  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body

    const data = await database.query.user.findFirst({
      where: eq(user.email, email),
    })

    const isSameAsCurrentPassword = await bcrypt.compare(newPassword, data.password)

    if (isSameAsCurrentPassword) {
      return errorResponse(res, "Your previous password and newPassword should not be the same", 400)
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await database.transaction(async (transaction) => {
      const data = await transaction
        .update(user)
        .set({ password: hashedPassword, updated_at: new Date() })
        .where(eq(user.email, email))
        .returning()
      
      if (data && data.length > 0) {
        const { first_name, last_name, email } = data[0];
      
        const emailContent = passwordResetEmail(first_name, last_name, email);
        await sendEmail("Password Reset", emailContent, email);
      }
      return successResponse(
        res,
        "Password Has Been reset",
        {}
      );
    })

  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

const completeProfile = async (req, res) => {
  try {
    const { phone, cnic, gender, address } = req.body

    const response = await database
      .update(user)
      .set({
        phone,
        cnic,
        gender,
        address,
        updated_at: new Date()
      })
      .where(eq(user.id, req.loggedInUserId))
      .returning()
    const percentage = calculateProfileCompletion(response[0])
    const data = await database
      .update(user)
      .set({
        profile_completion: percentage
      })
      .where(eq(user.id, req.loggedInUserId))
      .returning()
    const updatedUser = await database.query.user.findFirst({
      where: eq(user.id, req.loggedInUserId),
      with: {
        role:true
      }
    })
    return successResponse(res, "Profile is Updated!", updatedUser)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

const me = async (req, res) => {
  try {
    if (req.method === "GET") {
      
      // const data = await database.select().from(user).where(eq(user.id,req.loggedInUserId)).leftJoin(role, eq(role.id, user.role_id))
      const data = await database.query.user.findFirst(
        {
          where: eq(user.id, req.loggedInUserId),
          with: {
            role: true
          }
        })
      if (!data) {
        return successResponse(res, "No data Found against this user", data)
      }
      return successResponse(res, "User data is fetched successfully!", data)
    }
    if (req.method === "PATCH") {
      const { first_name, last_name, cnic, address, phone, gender } = req.body
      const data = await database
        .update(user)
        .set({
          first_name,
          last_name,
          phone,
          cnic,
          address,
          gender,
          updated_at: new Date()
        })
        .where(eq(user.id, req.loggedInUserId))
        .returning()
      if (data.length === 0) {
        return successResponse(res, "User Data is not updated!", data)
      }
      return successResponse(res, "User Data is updated!", data)
    }
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

const profilePicture = async (req, res) => {
  try {
    const profilePicturePath = req.file.path

    const currentPicture = await database.query.user.findFirst({
      where: eq(user.id, req.loggedInUserId),
      columns: {
        profile_picture: true,
      },
    })

    if (currentPicture && currentPicture.profile_picture) {
      if (fs.existsSync(currentPicture.profile_picture)) {
        fs.unlinkSync(currentPicture.profile_picture)
      }
    }

    const updatedUser = await database
      .update(user)
      .set({ profile_picture: profilePicturePath, updated_at: new Date() })
      .where(eq(user.id, req.loggedInUserId))
      .returning()

    const updated_url = `/${updatedUser[0].profile_picture.replace(/^public/, "").replace(/\\/g, "/")}`
    const percentage = calculateProfileCompletion(updatedUser[0])
    const data = await database
      .update(user)
      .set({
        profile_completion: percentage,
        profile_picture: updated_url
      })
      .where(eq(user.id, req.loggedInUserId))
      .returning()
    return successResponse(res, "Profile picture is set successfully!", data)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

const logOut = async (req, res) => {
  try {
    const token = getToken(req)
    const decodedToken = verifyToken(token)
    if (!token) {
      return unauthorizeResponse(res, "Authentication token is required")
    }

    const data = await database.insert(blackListToken).values({ token, expire_time: decodedToken.exp })
    return successResponse(res, "Log out successfully")
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const decoded = verifyToken(refreshToken);

    if (!decoded || !decoded.id || decoded.tokenType == 'access') {
      return errorResponse(res, "Invalid refresh token", 403);
    }


    const userData = await database.query.user.findFirst({ where: eq(user.id, decoded.id) });
    
    if (!userData) {
      return errorResponse(res, "User with this id does not exist", 400);
    }

    const newTokens = await createJWTToken(userData.id);
    return successResponse(res, "New access and refresh tokens sent", newTokens);

  } catch (error) {
    if (error.message === "TokenExpiredError") {
      return errorResponse(res, "Refresh token has expired", 401);
    } else if (error.message === "InvalidTokenError") {
      return errorResponse(res, "Invalid refresh token", 403);
    } else {
      return errorResponse(res, "Token verification failed", 500);
    }
  }
}

const switchRole = async (req, res) => {
  try {
    const userData = await database.query.user.findFirst({
      where: eq(user.id, req.loggedInUserId),
      with: {
        role: true
      }
    })
    if (userData.role.title != ROLES.RENTER) {
      return errorResponse(res, "User is already a Host.", 400)
    }
    if (userData.role.title === ROLES.RENTER) {
      const roleData = await getOrCreateRole(ROLES.HOST);
      const data = await database
        .update(user)
        .set({
          role_id: roleData[0].id
        })
        .where(eq(user.id, req.loggedInUserId))
      
        const updatedData = await database.query.user.findFirst({
          where: eq(user.id, req.loggedInUserId),
          with: {
            role: true
          }
        })
      
      return successResponse(res, "User become a Host!", updatedData)
    }
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

const licenseDetails = async (req, res) => {
  try {
    const driving_license_details = req.body
    const response = await database
      .update(user)
      .set({
        driving_license_details,
        updated_at: new Date()
      })
      .where(eq(user.id, req.loggedInUserId))
      .returning()
    const percentage = calculateProfileCompletion(response[0])
    const data = await database
      .update(user)
      .set({
        profile_completion: percentage
      })
      .where(eq(user.id, req.loggedInUserId))
      .returning()
      const updatedUser = await database.query.user.findFirst({
        where: eq(user.id, req.loggedInUserId),
        with: {
          role:true
        }
      })
    return successResponse(res, "License Details are Added!", updatedUser)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}


export {
  registerUser,
  verifyAccount,
  getNewOTP,
  loginUser,
  updatePassword,
  resetPassword,
  completeProfile,
  me,
  profilePicture,
  logOut,
  refreshToken,
  verifyOTP,
  switchRole,
  licenseDetails,
  upsertFcmToken
}