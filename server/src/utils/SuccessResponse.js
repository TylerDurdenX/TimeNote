class SuccessResponse {
    constructor(message, statusCode) {
  
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith("2") ? "Success" : "Success";
      this.message = message
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export default SuccessResponse;
  