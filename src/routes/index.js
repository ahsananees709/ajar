import express from "express";
import clientRoutes from './client/index.js'
import adminRoutes from './admin/index.js'

const router = express.Router()

router.use("/client", clientRoutes)
router.use("/admin", adminRoutes)


export default router