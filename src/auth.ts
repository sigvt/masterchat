import sha1 from "sha1";
import { DEFAULT_ORIGIN, SASH, XGAU, XGPID, XO } from "./constants";

export interface Credentials {
  SAPISID: string;
  APISID: string;
  HSID: string;
  SID: string;
  SSID: string;
}

export function buildAuthHeaders(
  creds: Credentials | undefined,
  sessionId?: string
) {
  if (!creds) return undefined;

  return {
    Cookie: genCookieString(creds),
    Authorization: genAuthToken(creds.SAPISID, DEFAULT_ORIGIN),
    [XO]: DEFAULT_ORIGIN,
    [XGAU]: "0",
    [XGPID]: sessionId,
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
  const hash = sha1(payload);
  return hash;
}
