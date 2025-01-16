import { eq } from "drizzle-orm"
import { database } from "../../db/db.js"
import { user } from "../../db/schema/user.js"
import { permission } from "../../db/schema/permission.js"
import { rolePermission } from "../../db/schema/rolePermissions.js"
import blackListToken from "../../db/schema/blacklisttoken.js"
import { getToken, verifyToken } from "../utils/helper.js"
import { errorResponse, unauthorizeResponse } from "../utils/response.handle.js"

const hasAnyPermission = async (userId, permissionNames) => {
  const userData = await database.query.user.findFirst({
    where: eq(user.id, userId),
    columns: { role_id: true },
  });

  if (!userData || !userData.role_id) {
    return false; 
  }
  const permissions = await database.query.rolePermission.findMany({
    where: eq(rolePermission.role_id, userData.role_id),
    with: {
      permission: true
    },
  });
  return permissions.some(perm => permissionNames.includes(perm.permission.title));
};

const authentication = async (req, res, next) => {
  try {
    const token = getToken(req)

    if (!token) {
      return unauthorizeResponse(res, "Authentication token is required")
    }

    const invalidToken = await database.query.blackListToken.findFirst({ where: eq(blackListToken.token, token) })
    if (invalidToken) {
      return unauthorizeResponse(res, "Unauthorize! Invalid Token")
    }

    let decodedToken

    try {
      decodedToken = verifyToken(token); 
      if (decodedToken.tokenType === 'refresh') {
        return unauthorizeResponse(res, "Invalid token! Refresh tokens cannot be used for authorization");
      }

    } catch (error) {
      if (error.message === "TokenExpiredError") {
        return unauthorizeResponse(res, "Token has expired");
      }
      if (error.message === "InvalidTokenError") {
        return unauthorizeResponse(res, "Invalid token");
      }
      return unauthorizeResponse(res, "Token verification failed");
    }

    const data = await database.query.user.findFirst({
      where: eq(user.id, decodedToken.id),
      columns: { id: true },
    })

    if (!data) {
      return unauthorizeResponse(res, "Unauthorize! User not Found")
    }
    // Sending LoggedIn user in the next middleware
    req.loggedInUserId = data.id
    next()
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

const authorization = (permissions) => {
  return async (req, res, next) => {
    const userId = req.loggedInUserId;
    if (!await hasAnyPermission(userId, permissions)) {
      return res.status(403).json({ message: "Forbidden: You do not have permission to use this route." });
    }
    
    next();
  };
};

const checkUserAlreadyRegistered = async (req, res, next) => {
  try {
    const { email } = req.body
    const data = await database.query.user.findFirst({
      where: eq(user.email, email),
      columns: { is_admin: true },
    })

    if (data) {
      return errorResponse(res, "user with this Email is already Registered", 409)
    }
    next()
  } catch (error) {
    errorResponse(res, error.message, 500)
  }
}

const checkUserIsAvailableAndVerified = async (req, res, next) => {
  try {
    const { email } = req.body
    const data = await database.query.user.findFirst({
      where: eq(user.email, email)
    })

    if (!data) {
      return errorResponse(res, "Unknown User! There is no user registered with provided email address.", 409)
    }
    if (!data.is_verified) {
      return errorResponse(res, "User not verified", 403)
    }
    next()
  } catch (error) {
    errorResponse(res, error.message, 500)
  }
}

export {
  authentication,
  authorization,
  checkUserAlreadyRegistered,
  checkUserIsAvailableAndVerified,
}
