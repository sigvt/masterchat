import axios from "axios";
import { setupRecorder } from "nock-record";
import { buildAuthHeaders } from "../auth";
import { DH } from "../constants";
import { findCfg, findInitialData } from ".";

const id = process.env.MC_MSG_TEST_ID;
const channelId = process.env.MC_MSG_TEST_CHANNEL_ID;
const credentialsB64 = process.env.MC_MSG_TEST_CREDENTIALS_SECOND;
const credentials = credentialsB64
  ? JSON.parse(Buffer.from(credentialsB64!, "base64").toString())
  : undefined;

const enabled = id && channelId && credentialsB64;
const describeif = enabled ? describe : describe.skip;

const mode = (process.env.NOCK_BACK_MODE as any) || "lockdown";
const record = setupRecorder({ mode });

jest.setTimeout(20 * 1000);

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

  it("can parse cfg", async () => {
    const cfg = findCfg(watchHtml);
    expect(cfg).not.toBeUndefined();
    expect(Object.keys(cfg)).toContain("DELEGATED_SESSION_ID");
  });

  it("can parse initialData", async () => {
    const cfg = findInitialData(watchHtml);
    expect(cfg).not.toBeUndefined();
  });
});
