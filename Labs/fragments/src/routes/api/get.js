const Fragment = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    // Get all fragments for the authenticated user using hashed userId
    const fragments = await Fragment.byUser(req.userId || req.user);

      // Allow expanded metadata when client requests ?expand=1
      const expand = req.query && (req.query.expand === '1' || req.query.expand === 'true');
      if (expand) {
        // Return full metadata for each fragment
        const metas = fragments.map((fragment) => ({
          id: fragment.id,
          ownerId: fragment.ownerId,
          created: fragment.created,
          updated: fragment.updated,
          type: fragment.type,
          size: fragment.size,
        }));
        return res.status(200).json(createSuccessResponse({ fragments: metas }));
      }

      // Default: return just the fragment IDs for security/privacy
      const fragmentIds = fragments.map((fragment) => fragment.id);

      res.status(200).json(createSuccessResponse({ fragments: fragmentIds }));
  } catch (error) {
    console.error('Error retrieving fragments:', error);
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};
