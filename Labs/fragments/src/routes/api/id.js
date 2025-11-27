const path = require('path');
const storage = require('../../storage-factory');
const Fragment = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

// Basic extension -> content type mapping for conversions
const extToType = {
  txt: 'text/plain',
  md: 'text/markdown',
  html: 'text/html',
  json: 'application/json',
  csv: 'text/csv',
  yaml: 'application/yaml',
  yml: 'application/yaml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
};

const tryRequire = (name) => {
  try {
    return require(name);
  } catch (_e) {
    return null;
  }
};

function csvToJson(text) {
  const parseSync = tryRequire('csv-parse/sync');
  if (!parseSync) {
    // fallback to naive parser
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) return [];
    const headers = lines[0].split(',').map((h) => h.trim());
    return lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim());
      const obj = {};
      headers.forEach((h, i) => (obj[h] = values[i] || ''));
      return obj;
    });
  }
  const records = parseSync.parse(text, { columns: true, skip_empty_lines: true });
  return records;
}

function jsonToCsv(objArray) {
  const stringifySync = tryRequire('csv-stringify/sync');
  if (!Array.isArray(objArray)) return '';
  if (!stringifySync) {
    const headers = Object.keys(objArray[0] || {});
    const lines = [headers.join(',')];
    objArray.forEach((o) => {
      lines.push(headers.map((h) => (o[h] !== undefined ? o[h] : '')).join(','));
    });
    return lines.join('\n');
  }
  const out = stringifySync.stringify(objArray, { header: true });
  return out;
}

async function handleGet(req, res, id, requestedExt, meta) {
  const data = await storage.readFragmentData(id);
  if (!data) return res.status(404).json(createErrorResponse(404, 'not found'));
  if (!requestedExt) {
    res.setHeader('Content-Type', meta.type);
    return res.status(200).send(data);
  }
  const targetType = extToType[requestedExt];
  if (!targetType) return res.status(415).json(createErrorResponse(415, 'unsupported target type'));

  const text = data.toString('utf8');
  const jsYaml = tryRequire('js-yaml');
  const MarkdownIt = tryRequire('markdown-it');
  const sharp = tryRequire('sharp');

  // JSON <-> YAML
  if (
    (meta.type === 'application/json' ||
      meta.type === 'application/yaml' ||
      meta.type === 'application/x-yaml') &&
    (targetType === 'application/json' || targetType === 'application/yaml')
  ) {
    try {
      if (
        meta.type === 'application/json' &&
        (targetType === 'application/yaml' || targetType === 'application/x-yaml')
      ) {
        const obj = JSON.parse(text);
        if (!jsYaml)
          return res.status(415).json(createErrorResponse(415, 'yaml library not available'));
        const yaml = jsYaml.dump(obj);
        res.setHeader('Content-Type', targetType);
        return res.status(200).send(yaml);
      }
      if (
        (meta.type === 'application/yaml' || meta.type === 'application/x-yaml') &&
        targetType === 'application/json'
      ) {
        if (!jsYaml)
          return res.status(415).json(createErrorResponse(415, 'yaml library not available'));
        const obj = jsYaml.load(text);
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).send(JSON.stringify(obj));
      }
    } catch (_e) {
      return res.status(415).json(createErrorResponse(415, 'conversion failed'));
    }
  }

  // JSON/YAML -> plain text (.txt): render human-readable text
  if (
    (meta.type === 'application/json' ||
      meta.type === 'application/yaml' ||
      meta.type === 'application/x-yaml') &&
    targetType === 'text/plain'
  ) {
    try {
      if (meta.type === 'application/json') {
        const obj = JSON.parse(text);
        // pretty-print JSON as plain text
        res.setHeader('Content-Type', 'text/plain');
        return res.status(200).send(JSON.stringify(obj, null, 2));
      }
      // YAML -> text: return original YAML text
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send(text);
    } catch (_e) {
      return res.status(415).json(createErrorResponse(415, 'conversion failed'));
    }
  }

  // CSV <-> JSON
  if (
    (meta.type === 'text/csv' && targetType === 'application/json') ||
    (meta.type === 'application/json' && targetType === 'text/csv')
  ) {
    try {
      if (meta.type === 'text/csv' && targetType === 'application/json') {
        const arr = csvToJson(text);
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).send(JSON.stringify(arr));
      }
      if (meta.type === 'application/json' && targetType === 'text/csv') {
        const obj = JSON.parse(text);
        const csv = jsonToCsv(obj);
        res.setHeader('Content-Type', 'text/csv');
        return res.status(200).send(csv);
      }
    } catch (_e) {
      return res.status(415).json(createErrorResponse(415, 'conversion failed'));
    }
  }

  // Markdown -> HTML
  if (meta.type === 'text/markdown' && targetType === 'text/html') {
    if (!MarkdownIt)
      return res.status(415).json(createErrorResponse(415, 'markdown library not available'));
    const md = new MarkdownIt();
    const html = md.render(text);
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  }

  // text <-> text basic passthrough
  if (meta.type.startsWith('text/') && targetType.startsWith('text/')) {
    res.setHeader('Content-Type', targetType);
    return res.status(200).send(text);
  }

  // images and other binaries: only allow same type for now
  // Image conversions using sharp when available
  if (meta.type.startsWith('image/') && targetType.startsWith('image/')) {
    if (!sharp)
      return res
        .status(415)
        .json(createErrorResponse(415, 'image conversion library not available'));
    // map content-type to sharp format
    const map = {
      'image/png': 'png',
      'image/jpeg': 'jpeg',
      'image/jpg': 'jpeg',
      'image/webp': 'webp',
      'image/avif': 'avif',
      'image/gif': 'gif',
    };
    const format = map[targetType];
    if (!format)
      return res.status(415).json(createErrorResponse(415, 'unsupported target image type'));
    try {
      const out = await sharp(data).toFormat(format).toBuffer();
      res.setHeader('Content-Type', targetType);
      return res.status(200).send(out);
    } catch (_e) {
      return res.status(415).json(createErrorResponse(415, 'image conversion failed'));
    }
  }

  if (meta.type === targetType) {
    res.setHeader('Content-Type', meta.type);
    return res.status(200).send(data);
  }

  return res.status(415).json(createErrorResponse(415, 'unsupported conversion'));
}

module.exports = async (req, res) => {
  const raw = req.params.id;
  const parsed = path.parse(raw);
  const id = parsed.name;
  const requestedExt = parsed.ext ? parsed.ext.slice(1) : null;

  const meta = await storage.readFragmentMeta(id);
  if (!meta) return res.status(404).json(createErrorResponse(404, 'not found'));

  // Ownership: use req.userId (hashed via auth middleware) when available
  const userHash = req.userId || (req.user && req.user.email && require('crypto').createHash('sha256').update(req.user.email).digest('hex'));
  if (!userHash) return res.status(401).json(createErrorResponse(401, 'unauthorized'));
  if (meta.ownerId !== userHash) return res.status(403).json(createErrorResponse(403, 'forbidden'));

  // Info route
  if (req.path.endsWith('/info')) {
    return res.json(createSuccessResponse({ fragment: meta }));
  }

  // PUT -> update
  if (req.method === 'PUT') {
    try {
      const contentType = req.header('Content-Type') || meta.type;
      const { isAllowed } = require('../../content-types');
      if (!isAllowed(contentType))
        return res.status(415).json(createErrorResponse(415, 'unsupported media type'));
      // Enforce immutable type requirement
      if (contentType !== meta.type)
        return res.status(400).json(createErrorResponse(400, 'content type mismatch'));

      let buffer;
      if (Buffer.isBuffer(req.body)) buffer = req.body;
      else {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        buffer = Buffer.concat(chunks);
      }

      const fragment = await Fragment.byId(id);
      if (!fragment) return res.status(404).json(createErrorResponse(404, 'not found'));
      // Do not change fragment.type
      const updatedMeta = await fragment.setData(buffer);
      return res.status(200).json(createSuccessResponse({ fragment: updatedMeta }));
    } catch (_e) {
      if (_e.message === 'content-type-mismatch')
        return res.status(400).json(createErrorResponse(400, 'content type mismatch'));
      return res.status(500).json(createErrorResponse(500, 'unable to update'));
    }
  }

  // DELETE -> remove fragment
  if (req.method === 'DELETE') {
    const fragment = await Fragment.byId(id);
    if (!fragment) return res.status(404).json(createErrorResponse(404, 'not found'));
    const ok = await fragment.delete();
    if (!ok) return res.status(404).json(createErrorResponse(404, 'not found'));
    return res.status(200).json(createSuccessResponse());
  }

  // GET -> deliver resource or attempt conversion
  if (req.method === 'GET') {
    return handleGet(req, res, id, requestedExt, meta);
  }

  return res.status(405).json(createErrorResponse(405, 'method not allowed'));
};
