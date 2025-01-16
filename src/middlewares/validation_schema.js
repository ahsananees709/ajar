import { z } from "zod"
import { errorResponse } from "../utils/response.handle.js"


const validationMiddleware = (schema, parseParam) => {
  return (req, res, next) => {
    try {
      schema.parse(parseParam(req))
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorDetails = error.errors.map(err => ({ field: err.path[0], message: err.message }))
        return errorResponse(res, errorDetails, 400)
      }
      return errorResponse(res, error.message, 500)
    }
  }
}


export { validationMiddleware }
