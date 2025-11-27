const Fragment = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

/**
 * Create a new fragment
 */
module.exports = async (req, res) => {
  const contentType = req.get('Content-Type');
  if (!contentType) return res.status(415).json(createErrorResponse(415, 'Missing Content-Type header'));
  if (!Fragment.isSupportedType(contentType))
    return res.status(415).json(createErrorResponse(415, 'Unsupported content type'));

  if (!Buffer.isBuffer(req.body))
    return res.status(400).json(createErrorResponse(400, 'Invalid request body'));

  try {
    // Use hashed user id if available (auth middleware sets req.userId)
    const ownerId = req.userId || req.user && req.user.email || req.user;
    const fragment = new Fragment({ ownerId, type: contentType, size: req.body.length });
    await fragment.setData(req.body);
    await fragment.save();
    const location = `${req.protocol}://${req.get('host')}/v1/fragments/${fragment.id}`;
    res.setHeader('Location', location);
    return res.status(201).json(
      createSuccessResponse({
        fragment: {
          id: fragment.id,
          ownerId: fragment.ownerId,
          created: fragment.created,
          updated: fragment.updated,
          type: fragment.type,
          size: fragment.size,
        },
      })
    );
  } catch (_e) {
    console.error('Error creating fragment:', _e);
    return res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};
