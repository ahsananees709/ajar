import express from "express";
import roleRoutes from './role.js'
import permissionRoutes from './permission.js'
import userRoutes from './user.js'
import vehicleRoutes from './vehicle.js'
import bookingRoutes from './booking.js'

const router = express.Router()

router.use("/role", roleRoutes)
router.use("/permission", permissionRoutes)
router.use('/user', userRoutes)
router.use('/vehicle', vehicleRoutes)
router.use('/booking', bookingRoutes)

export default router