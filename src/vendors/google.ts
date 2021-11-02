/**
 * Integrating Google Sign-In into your web app
 * https://developers.google.com/identity/sign-in/web/sign-in
 */
import { OAuth2Client } from "google-auth-library";
export default new OAuth2Client(process.env.GOOGLE_OAUTH_CLIENT_ID);
