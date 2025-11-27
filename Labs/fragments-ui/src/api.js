// Resolve API_URL at runtime if not provided at build time.
// When deployed to EC2, this will default to the same host with port 8080
// (where your fragments server typically runs), e.g. http://ec2-*.amazonaws.com:8080
const apiUrl = (function () {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_URL) {
      return process.env.API_URL;
    }
  } catch (e) {
    // ignore
  }
  if (typeof window !== 'undefined' && window.location) {
    const protocol = window.location.protocol || 'http:';
    const hostname = window.location.hostname || 'localhost';
    // Default fragments server port
    const port = '8080';
    return `${protocol}//${hostname}:${port}`;
  }
  return 'http://localhost:8080';
})();

async function getUserFragments(user, expand = false) {
  const url = expand ? `${apiUrl}/v1/fragments?expand=1` : `${apiUrl}/v1/fragments`;
  const response = await fetch(url, {
    headers: user.authorizationHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to get fragments: ${response.status}`);
  }
  return await response.json();
}

async function createFragment(user, content, contentType = 'text/plain') {
  const response = await fetch(`${apiUrl}/v1/fragments`, {
    method: 'POST',
    headers: user.authorizationHeaders(contentType),
    body: content,
  });
  if (!response.ok && response.status !== 201) {
    throw new Error(`Failed to create fragment: ${response.status}`);
  }
  return await response.json();
}

export { getUserFragments, createFragment };
