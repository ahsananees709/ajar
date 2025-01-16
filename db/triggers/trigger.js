import { isNull, lt, or } from "drizzle-orm"
import blacklistToken from "../schema/blacklisttoken.js"
import { database } from "../db.js"
import cron from 'node-cron';

const deleteExpiredTokens = async () => {
  try {
    const currentTime = Math.floor(Date.now() / 1000)
    const data = await database
      .delete(blacklistToken)
      .where(or(lt(blacklistToken.expire_time, currentTime), isNull(blacklistToken.expire_time)))
      .returning()

    console.log("Expired BlackListed Tokens are deleted!", data)
  } catch (error) {
    console.log({ error: error.message })
  }
}

// Schedule to run every minute
cron.schedule('0 * * * *', deleteExpiredTokens);


deleteExpiredTokens()

export { deleteExpiredTokens }
