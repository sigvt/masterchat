import sha1 from "sha1";
import { DO, SASH, XGAU, XGPID, XO } from "./constants";
import { Credentials } from "./interfaces";

export function buildAuthHeaders(creds: Credentials): Record<string, string> {
  const dsid = creds.DELEGATED_SESSION_ID ?? creds.SESSION_ID;
  return {
    Cookie: genCookieString(creds),
    Authorization: genAuthToken(creds.SAPISID, DO),
    [XO]: DO,
    [XGAU]: "0",
    ...(dsid && { [XGPID]: dsid }),
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
  return hash.toString();
}
