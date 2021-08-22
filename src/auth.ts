import sha1 from "sha1";
import { DEFAULT_ORIGIN } from "./constants";

export interface Credentials {
  SAPISID: string;
  APISID: string;
  HSID: string;
  SID: string;
  SSID: string;
}

export function buildAuthHeaders(creds: Credentials | undefined) {
  if (!creds) return undefined;

  return {
    Cookie: genCookieString(creds),
    Authorization: genAuthToken(creds.SAPISID, DEFAULT_ORIGIN),
    "X-Origin": DEFAULT_ORIGIN,
  };
}

function genCookieString(creds: Credentials) {
  return Object.entries(creds)
    .map(([key, value]) => `${key}=${value};`)
    .join(" ");
}

function genAuthToken(sid: string, origin: string): string {
  return `SAPISIDHASH ${genSapisidHash(sid, origin)}`;
}

function genSapisidHash(sid: string, origin: string): string {
  const now = Math.floor(new Date().getTime() / 1e3);
  const payload = [now, sid, origin];
  const digest = sha1Digest(payload.join(" "));
  return [now, digest].join("_");
}

function sha1Digest(payload: string): string {
  const hash = sha1(payload);
  return hash;
}
