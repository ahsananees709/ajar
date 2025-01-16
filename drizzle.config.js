import { DATABASE_URL } from "./src/utils/constant.js"


export default {
  dialect: "postgresql",
  schema: "./db/schema",
  out: "./migrations",
  dbCredentials: {
    connectionString: DATABASE_URL,
  },
}
