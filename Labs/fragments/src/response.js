const createSuccessResponse = (data) => ({ status: 'ok', ...(data || {}) });

const createErrorResponse = (code, message) => ({
  status: 'error',
  error: { code, message },
});

module.exports = { createSuccessResponse, createErrorResponse };
