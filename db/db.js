import { drizzle } from "drizzle-orm/node-postgres"
import pkg from "pg"
import { DATABASE_URL, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } from "../src/utils/constant.js"
import * as user from "./schema/user.js"
import blackListToken from "./schema/blacklisttoken.js"
import * as role from './schema/role.js'
import * as permission from './schema/permission.js' 
import * as  rolePermission from './schema/rolePermissions.js'
import * as vehicle from './schema/vehicle.js'
import * as vehicleReview from './schema/vehicleReview.js'
import * as booking from './schema/booking.js'
import * as favorite from './schema/favorite.js'
import * as userReview from './schema/userReview.js'
import * as conversation from "./schema/conversation.js"
import * as message from "./schema/message.js"
import * as userDevices from "./schema/userDevices.js"

const { Pool } = pkg

const pool = new Pool({
  connectionString: DATABASE_URL || `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
})

pool
  .connect()
  .then(async () => {
    console.log("Database connection has been established successfully.")
    
  })

  
  .catch(err => {
    console.error("Unable to connect to the database:", err)
  })

export const database = drizzle(pool,
  {
    schema:
    {
      ...user,
      blackListToken,
      ...role,
      ...permission,
      ...rolePermission,
      ...vehicle,
      ...vehicleReview,
      ...booking,
      ...favorite,
      ...userReview,
      ...conversation,
      ...message,
      ...userDevices
    }
  })

