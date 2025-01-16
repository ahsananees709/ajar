import {message} from "../../../db/schema/message.js";
import { eq } from "drizzle-orm"
import { database } from "../../../db/db.js";
import { successResponse, errorResponse } from "../../utils/response.handle.js";
import admin from "../../utils/firebase.js";
import { conversation } from "../../../db/schema/conversation.js";
import { user } from '../../../db/schema/user.js'
import { BASE_URL } from "../../utils/constant.js";
import { userDevices } from "../../../db/schema/userDevices.js";

const buildUrl = (base, path) => {
    // Remove trailing slash from base if it exists
    if (base.endsWith('/')) {
      base = base.slice(0, -1);
    }
  
    // Ensure path doesn't start with a slash
    if (path.startsWith('/')) {
      path = path.slice(2);
    }
  
    return `${base}/${path}`;
  };
  
// const createMessage = async (req, res) => {
//     try {
//         const { conversation_id, text } = req.body
//         const conversationData = await database.query.conversation.findFirst({
//             where: eq(conversation.id, conversation_id)
//         })
//         const receiverId = conversationData.members.find((item) => item !== req.loggedInUserId)
//         const receiverData = await database.query.user.findFirst({
//             where: eq(user.id, receiverId)
//         })
//         const senderData = await database.query.user.findFirst({
//             where: eq(user.id, req.loggedInUserId)
//         })

//         const data = await database
//             .insert(message)
//             .values({
//                 conversation_id: conversation_id,
//                 sender_id: req.loggedInUserId,
//                 text
//             })
//             .returning()
//         const imageUrl = buildUrl(BASE_URL, senderData.profile_picture);
//         const notificationMessage = {
//             notification: {
//                 title: `${senderData.first_name} ${senderData.last_name}`,
//                 body: text,
//                 image: imageUrl
//             },
//             data: {
//                 type: 'chat',
//                 conversation_id: conversation_id,
//                 sender_id: senderData.id,
//                 sender_name: `${senderData.first_name} ${senderData.last_name}`,
//                 profile_picture: `${senderData.profile_picture}`,
//                 message_content: text,
//                 // timestamp: data.created_at
//             },
//             token: receiverData.fcm_token,
//             android: {
//                 priority: "high",
//                 notification: {
//                     channel_id: "high_importance_channel"
//                 }
//             }
//         };
//         await admin.messaging().send(notificationMessage);
//         return successResponse(res, "Message created successfully!", data)
//     } catch (error) {
//         return errorResponse(res, error.message, 500)
//     }
// }

const createMessage = async (req, res) => {
    try {
        const { conversation_id, text } = req.body;

        const conversationData = await database.query.conversation.findFirst({
                        where: eq(conversation.id, conversation_id)
                    })

                    const receiverId = conversationData.members.find((item) => item !== req.loggedInUserId)
                            const receiverData = await database.query.user.findFirst({
                                where: eq(user.id, receiverId)
                            })
                            const senderData = await database.query.user.findFirst({
                                where: eq(user.id, req.loggedInUserId)
                            })

        const receiverTokens = await database.query.userDevices.findMany({
            where: eq(userDevices.user_id, receiverId)
        });

        const fcmTokens = receiverTokens.map((device) => device.fcm_token);

        // Save the message to the database
        const data = await database
            .insert(message)
            .values({
                conversation_id: conversation_id,
                sender_id: req.loggedInUserId,
                text
            })
            .returning();

        // Build notification payload
        const imageUrl = buildUrl(BASE_URL, senderData.profile_picture);
        const notificationMessage = {
            notification: {
                title:`${senderData.first_name} ${senderData.last_name}`,
                body: text,
                image: imageUrl
            },
            data: {
                type: 'chat',
                conversation_id: conversation_id,
                sender_id: senderData.id,
                sender_name: `${senderData.first_name} ${senderData.last_name}`,
                profile_picture: senderData.profile_picture,
                message_content: text,
                // timestamp: data.created_at
            },
            android: {
                priority: "high",
                notification: {
                    channel_id: "high_importance_channel"
                }
            }
        };
        if (!receiverData.online || receiverData.activeConversation != conversation_id)
        {
            const sendPromises = fcmTokens.map((token) => {
                return admin.messaging().send({ ...notificationMessage, token });
            });
    
            await Promise.all(sendPromises);
        }

        return successResponse(res, "Message created successfully!", data);
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};




const getMessages = async (req, res) => {
    try {
        const conversation_id = req.params.conversation_id
        const messages = await database.query.message.findMany({
            where: (
                eq(message.conversation_id, conversation_id)
            )
        })
        if (messages.length <= 0) {
            return successResponse(res,"No messages against this conversation_id!",messages)
        }
        return successResponse(res,"Messages found against this conversation_id!",messages)
    } catch (error) {
        return errorResponse(res,error.message,500)
    }
}

  
export {createMessage,getMessages}