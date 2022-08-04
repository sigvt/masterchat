import axios from "axios";
import { setupRecorder } from "nock-record";
import { describe, expect, it, beforeAll } from "vitest";
import { findCfg, findInitialData } from ".";
import { buildAuthHeaders } from "../auth";
import { DH } from "../constants";

const id = process.env.MC_TEST_VIDEO_ID;
const channelId = process.env.MC_TEST_CHANNEL_ID;
const credentialsB64 = process.env.MC_TEST_CREDENTIAL_2;
const credentials = credentialsB64
  ? JSON.parse(Buffer.from(credentialsB64!, "base64").toString())
  : undefined;

const enabled = id && channelId && credentialsB64;
const describeif = enabled ? describe : describe.skip;

const mode = (process.env.NOCK_BACK_MODE as any) || "lockdown";
const record = setupRecorder({ mode });

describeif("watch", () => {
  let watchHtml: string;

  beforeAll(async () => {
    const { completeRecording } = await record("watch");
    const res = await axios.get("https://www.youtube.com", {
      headers: {
        ...DH,
        ...buildAuthHeaders(credentials),
      },
    });
    watchHtml = res.data;
    completeRecording();
  });

  it(
    "can parse cfg",
    async () => {
      const cfg = findCfg(watchHtml);
      expect(cfg).not.toBeUndefined();
      expect(Object.keys(cfg)).toContain("DELEGATED_SESSION_ID");
    },
    20 * 1000
  );

  it(
    "can parse initialData",
    async () => {
      const cfg = findInitialData(watchHtml);
      expect(cfg).not.toBeUndefined();
    },
    20 * 1000
  );
});
