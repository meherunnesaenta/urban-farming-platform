class ResponseHandler {
  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    });
  }

  static error(res, error, message = 'Error', statusCode = 400) {
    return res.status(statusCode).json({
      success: false,
      error,
      message,
      timestamp: new Date().toISOString()
    });
  }

  static paginated(res, data, total, page, limit, message = 'Success', statusCode = 200) {
    const totalPages = Math.ceil(total / limit);
    return res.status(statusCode).json({
      success: true,
      data,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        hasMore: parseInt(page) < totalPages
      },
      message,
      timestamp: new Date().toISOString()
    });
  }

  static created(res, data, message = 'Created successfully') {
    return this.success(res, data, message, 201);
  }

  static notFound(res, message = 'Resource not found') {
    return this.error(res, 'Not Found', message, 404);
  }

  static unauthorized(res, message = 'Unauthorized') {
    return this.error(res, 'Unauthorized', message, 401);
  }

  static forbidden(res, message = 'Forbidden') {
    return this.error(res, 'Forbidden', message, 403);
  }

  static badRequest(res, message = 'Bad Request') {
    return this.error(res, 'Bad Request', message, 400);
  }
}

module.exports = ResponseHandler;
