import express from "express";
import authRoutes from './user.js'
import vehicleRoutes from './vehicle.js'
import bookingRoutes from './booking.js'
import favoriteRoutes from './favorite.js'
import vehicleReviewRoutes from './vehicleReview.js'
import userReviewRoutes from './userReview.js'
import conversationRoutes from './conversation.js'
import messageRoutes from './message.js'

const router = express.Router()

router.use("/user", authRoutes)
router.use("/vehicle", vehicleRoutes)
router.use("/booking", bookingRoutes)
router.use("/favorite", favoriteRoutes)
router.use("/vehicle-review", vehicleReviewRoutes)
router.use("/user-review", userReviewRoutes)
router.use("/conversation", conversationRoutes)
router.use("/message", messageRoutes)



export default router