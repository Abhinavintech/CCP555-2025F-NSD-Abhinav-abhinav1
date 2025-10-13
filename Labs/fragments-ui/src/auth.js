import { UserManager } from 'oidc-client-ts';

// Use the Cognito Hosted UI domain: <domainPrefix>.auth.<region>.amazoncognito.com
const region =
  (process.env.AWS_COGNITO_POOL_ID || '').split('_')[0] || 'us-east-1';
const domainPrefix = process.env.AWS_COGNITO_DOMAIN;
const authority = domainPrefix
  ? `https://${domainPrefix}.auth.${region}.amazoncognito.com`
  : undefined;

const cognitoAuthConfig = {
  authority,
  client_id: process.env.AWS_COGNITO_CLIENT_ID,
  redirect_uri: process.env.OAUTH_SIGN_IN_REDIRECT_URL,
  post_logout_redirect_uri: process.env.OAUTH_SIGN_IN_REDIRECT_URL,
  response_type: 'code',
  scope: 'openid email profile',
  automaticSilentRenew: false,
};

const userManager = new UserManager({
  ...cognitoAuthConfig,
});

export { userManager };

export async function signIn() {
  try {
    if (!userManager || !userManager.settings || !userManager.settings.authority) {
      const msg = 'Cognito configuration missing: AWS_COGNITO_DOMAIN or AWS_COGNITO_POOL_ID not set. Please set these in .env and rebuild.';
      console.error(msg, { settings: userManager && userManager.settings });
      // friendly UI hint
      alert(msg);
      return;
    }
    console.info('Initiating signinRedirect with authority=', userManager.settings.authority);
    await userManager.signinRedirect();
  } catch (err) {
    console.error('signinRedirect failed:', err);
    alert('Failed to start login redirect (see console).');
  }
}

export async function signOut() {
  try {
    // Clear the user from the UserManager first
    await userManager.removeUser();
  } catch (error) {
    console.error('Error clearing local session:', error);
  }

  // For Cognito, construct the Hosted UI logout URL using env-configured domain
  const region =
    (process.env.AWS_COGNITO_POOL_ID || '').split('_')[0] || 'us-east-1';
  const domainPrefix = process.env.AWS_COGNITO_DOMAIN;
  if (!domainPrefix) {
    console.error('Missing AWS_COGNITO_DOMAIN for logout');
    return;
  }
  const logoutUrl = `https://${domainPrefix}.auth.${region}.amazoncognito.com/logout?client_id=${
    process.env.AWS_COGNITO_CLIENT_ID
  }&logout_uri=${encodeURIComponent(process.env.OAUTH_SIGN_IN_REDIRECT_URL)}`;
  window.location.href = logoutUrl;
}

function formatUser(user) {
  console.log('User Authenticated', { user });
  return {
    username: user.profile.preferred_username || user.profile.email,
    email: user.profile.email,
    idToken: user.id_token,
    accessToken: user.access_token,
    authorizationHeaders: (type = 'application/json') => ({
      'Content-Type': type,
      // Use the access token for resource server authorization when available.
      Authorization: `Bearer ${user.access_token || user.accessToken || user.id_token}`,
    }),
  };
}

export async function getUser() {
  try {
    if (window.location.search.includes('code=')) {
      // handle redirect callback
      try {
        const user = await userManager.signinCallback();
        window.history.replaceState({}, document.title, window.location.pathname);
        return formatUser(user);
      } catch (cbErr) {
        console.error('signinCallback error:', cbErr);
        return null;
      }
    }
    const user = await userManager.getUser();
    return user ? formatUser(user) : null;
  } catch (err) {
    console.error('getUser failed:', err);
    return null;
  }
}
