import express from "express"
import { createConversation, getConversation } from "../../controllers/client/conversation.js"
import { authentication } from "../../middlewares/auth_middlewares.js"

const router = express.Router()

router.post("/",
    authentication,
    createConversation,
)

router.get("/",
    authentication,
    getConversation,
)


export default router