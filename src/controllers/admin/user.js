import bcrypt from "bcrypt"
import { user } from "../../../db/schema/user.js"
import { database } from "../../../db/db.js"
import { successResponse, errorResponse } from "../../utils/response.handle.js"
import { eq, and, ne } from "drizzle-orm"
import { generateRandomPassword } from "../../utils/helper.js"
import { ROLES } from "../../utils/constant.js"
import { getOrCreateRole } from "../../../db/customqueries/queries.js"
import { adminCreateUser } from "../../utils/emailTemplate.js"
import { count, like } from "drizzle-orm";
import { createJWTToken } from "../../utils/helper.js"
import sendEmail from "../../utils/sendEmail.js"

// const getAllUsers = async (req, res) => {
//     try {
//         const data = await database.query.user.findMany({
//             with: {
//                 role:true
//             }
//         })
//         return successResponse(res,"Users Fetched Successfuly!",data)
//     } catch (error) {
//         return errorResponse(res,error.message,500)
//     }
// }

const loginUser = async (req, res) => {
    try {
      const { email, password } = req.body
  
      const data = await database.query.user.findFirst({
        where: eq(user.email, email),
        with: {
          role:true
        }
      })
    
        if (data.role.title !== 'Admin' || !data.is_admin) {
            return errorResponse(res,"Login failed: insufficient privileges!",400)
        }
  
      const isPasswordValid = await bcrypt.compare(password, data.password)
  
      if (!isPasswordValid) {
        return errorResponse(res,"Credentials were Wrong!",400)
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

const filterUsers = async (req, res) => {
    try {
        // Extract query parameters for filtering and pagination
        let { userId, roleId, email, first_name, isActive, page = 1, limit = 10 } = req.query;

        // Transform 'isActive' string into boolean if necessary
        if (isActive) {
            isActive = isActive === 'true';
        }

        // Array to store conditions for filtering users
        const userConditions = [];
        if (userId) userConditions.push(eq(user.id, userId));
        if (roleId) userConditions.push(eq(user.role_id, roleId));
        if (email) userConditions.push(eq(user.email, email));
        if (first_name) userConditions.push(like(user.first_name, `%${first_name}%`)); // Using LIKE for name
        if (typeof isActive === 'boolean') userConditions.push(eq(user.is_active, isActive));

        // Pagination logic
        const offset = (Number(page) - 1) * Number(limit);

        // Fetch filtered users with pagination
        const filteredUsers = await database.query.user.findMany({
            where: and(...userConditions),
            limit: Number(limit),
            offset,
            with: {
                role: true
            }
        });

        // Get total count of users under the applied filters (without pagination)
        const totalCount = await database
            .select({ count: count() })
            .from(user)
            .where(and(...userConditions));

        // Calculate next page URL
        const nextPage = Number(page) + 1;
        const totalPages = Math.ceil(Number(totalCount[0].count) / Number(limit));
        let nextPageUrl = null;

        if (nextPage <= totalPages) {
            const baseUrl = `${req.protocol}://${req.get('admin')}${req.baseUrl}/filter`;
            const queryString = new URLSearchParams({
                ...req.query,
                page: nextPage
            }).toString();
            nextPageUrl = `${baseUrl}?${queryString}`;
        }

        return successResponse(res, "Users fetched successfully", {
            users: filteredUsers,
            totalCount: totalCount[0].count,
            nextPageUrl,
        });

    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};


const getSingleUser = async (req, res) => {
    try {
        const {userId} = req.params
        const data = await database.query.user.findFirst({
            where: eq(user.id, userId),
                with:{
                role:true
            }
        })
        if (!data) {
            return errorResponse(res,"User not found.",400)
        }
        return successResponse(res,"User data fetched successfully!",data)
        
    } catch (error) {
        return errorResponse(res,error.message,500)
    }
}

const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params
        await database.transaction(async (transaction) => {
            const data = await transaction.delete(user).where(eq(user.id, userId));
            return successResponse(res,"User data fetched successfully!",data)
        })      
    } catch (error) {
        return errorResponse(res,error.message,500)
    }
}

const createUser = async (req, res) => {
    const { first_name, last_name, email, roleId } = req.body;
    const password = generateRandomPassword()
    const hashedPassword = await bcrypt.hash(password, 10);
    // const defaultRole = await getOrCreateRole(ROLES.RENTER)
    try {
        await database.transaction(async (transaction) => {
            const data = await transaction
                .insert(user)
                .values({
                    first_name,
                    last_name,
                    email,
                    password: hashedPassword,
                    is_verified: true,
                    role_id: roleId
                })
                .returning();
            const emailContent = adminCreateUser(first_name, last_name, email, password);
            await sendEmail("Account Created Successfully by Admin - Welcome!", emailContent, email);

            return successResponse(
                res,
                "User Registered Successfully! An email has been sent with username and password to user email.",
                { data }
            );
        });
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
}

const updateUser = async (req, res) => {
    try {
        const {userId} = req.params
        const { first_name, last_name, email, roleId } = req.body;
        const userData = await database.query.user.findFirst({
            where:(and(ne(user.id,userId),eq(user.email,email)))
        })
        if (userData) {
            return errorResponse(res,'User with this email already registered.',400)
        }
        await database.transaction(async (transaction) => {
            const data = await transaction
            .update(user)
                .set({
                    first_name,
                    last_name,
                    email,
                    role_id: roleId
            })
              .where(eq(user.id, userId))
              .returning()
            return successResponse(
                res,
                "User updated successfully!",
                 data 
            );
        })
    } catch (error) {
        return errorResponse(res,error.message,500)
    }
}
const me = async (req, res) => {
    try {
      if (req.method === "GET") {
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
            const userData = await database.query.user.findFirst({
                where: eq(user.id,req.loggedInUserId)
            })
        const { first_name, last_name, password, phone } = req.body;
        let updateFields = {
            first_name,
            last_name,
            phone,
            updated_at: new Date()
        };
    
        if (password) {
            const isMatch = await bcrypt.compare(password, userData.password)
            if (isMatch) {
                return errorResponse(res,"Previous and new password must be different!",400)
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.password = hashedPassword;
        }
    
        try {
            const data = await database
                .update(user)
                .set(updateFields)
                .where(eq(user.id, req.loggedInUserId))
                .returning();
    
            if (data.length === 0) {
                return successResponse(res, "User Data is not updated!", data);
            }
            return successResponse(res, "User Data is updated!", data);
        } catch (error) {
            return errorResponse(res, error.message, 500);
        }
    }
    
    } catch (error) {
      return errorResponse(res, error.message, 500)
    }
  }
export {
    loginUser,
    filterUsers,
    getSingleUser,
    createUser,
    deleteUser,
    updateUser,
    me
}