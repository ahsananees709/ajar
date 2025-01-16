import { pgTable, uuid, varchar, jsonb,timestamp } from "drizzle-orm/pg-core"
import { message } from "./message.js";
import { relations } from "drizzle-orm";

const conversation = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  members: jsonb("members").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
})


const conversationRelations = relations(conversation, ({ many }) => ({
  messages: many(message)
}));

export {conversation, conversationRelations}
