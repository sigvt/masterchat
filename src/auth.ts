// import sha1 from "sha1";
import crypto from "crypto";
import { DO, SASH, XGAU, XGPID, XO } from "./constants";

export interface Credentials {
  SAPISID: string;
  APISID: string;
  HSID: string;
  SID: string;
  SSID: string;
  SESSION_ID?: string;
}

export function buildAuthHeaders(creds: Credentials): Record<string, string> {
  return {
    Cookie: genCookieString(creds),
    Authorization: genAuthToken(creds.SAPISID, DO),
    [XO]: DO,
    [XGAU]: "0",
    ...(creds.SESSION_ID && { [XGPID]: creds.SESSION_ID }),
  };
}

function genCookieString(creds: Credentials) {
  return Object.entries(creds)
    .map(([key, value]) => `${key}=${value};`)
    .join(" ");
}

function genAuthToken(sid: string, origin: string): string {
  return `${SASH} ${genSash(sid, origin)}`;
}

function genSash(sid: string, origin: string): string {
  const now = Math.floor(new Date().getTime() / 1e3);
  const payload = [now, sid, origin];
  const digest = sha1Digest(payload.join(" "));
  return [now, digest].join("_");
}

function sha1Digest(payload: string): string {
  const hash = crypto.createHash("sha1");
  hash.update(payload);
  // const hash = sha1(payload);
  return hash.digest("hex");
}
