const { createSuccessResponse } = require('../../response');

/**
 * Health check endpoint
 * Returns the current status of the fragments service
 */
module.exports = (req, res) => {
  const healthData = {
    status: 'ok',
    author: 'Abhinav Bhardwaj',
    githubUrl: 'https://github.com/Abhinavintech/CCP555-2025F-NSD-Abhinav-abhinav1',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  };

  res.status(200).json(createSuccessResponse(healthData));
};