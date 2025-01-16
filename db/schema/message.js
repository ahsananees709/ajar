import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core"
import {conversation} from "./conversation.js"
import { relations } from "drizzle-orm"

const message = pgTable("messages", {
    id: uuid("id").defaultRandom().primaryKey(),
    conversation_id: uuid("conversation_id").references(() => conversation.id,{onDelete: 'cascade'}).notNull(), 
    sender_id: uuid("sender_id").notNull(),
    text: text("text"),
    created_at: timestamp("created_at").notNull().defaultNow(),
})

 const messageRelations = relations(message, ({ one }) => ({
    conversation: one(conversation, {
      fields: [message.conversation_id], 
      references: [conversation.id],   
    }),
  }));


export {message, messageRelations}
