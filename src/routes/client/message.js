import express from "express"
import { createMessage,getMessages } from "../../controllers/client/message.js"
import { authentication } from "../../middlewares/auth_middlewares.js"

const router = express.Router()

router.post("/",
    authentication,
    createMessage,
)

router.get("/:conversation_id",
    authentication,
    getMessages,
)


export default router