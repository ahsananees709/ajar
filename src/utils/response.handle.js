const response = async (res, statusCode, success, message, data) => {
    return res.status(statusCode).json({
      success,
      statusCode,
      message,
      data,
    })
  }
  const successResponse = async (res, message, data = {}) => {
    return response(res, 200, true, message, data)
  }
  const errorResponse = async (res, message = "Server Error", status = 500) => {
    return response(res, status, false, message)
  }
  
  const unauthorizeResponse = async (res, message) => {
    return response(res, 401, false, message)
  }
  
  export { successResponse, errorResponse, unauthorizeResponse }
  