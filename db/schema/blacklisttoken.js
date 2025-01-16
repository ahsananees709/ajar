import { pgTable, uuid, varchar, bigint } from "drizzle-orm/pg-core"

const blackListToken = pgTable("blacklisttokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  token: varchar("token", { length: 255 }).notNull(),
  expire_time: bigint("expire_time", { mode: "number" }),
})

export default blackListToken
