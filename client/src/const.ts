export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  if (!oauthPortalUrl) {
    console.error(
      "[getLoginUrl] VITE_OAUTH_PORTAL_URL is not set at build time; " +
        "falling back to '/' instead of throwing an Invalid URL error."
    );
    return "/";
  }

  let url: URL;
  try {
    url = new URL(`${oauthPortalUrl}/app-auth`);
  } catch (err) {
    console.error("[getLoginUrl] Invalid VITE_OAUTH_PORTAL_URL:", oauthPortalUrl, err);
    return "/";
  }

  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
