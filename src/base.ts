import { Credentials, buildAuthHeaders } from "./auth";
import { DEFAULT_HEADERS, DEFAULT_ORIGIN } from "./constants";
import fetch from "cross-fetch";
import { LiveChatContext, Metadata } from "./services/context/exports";
import { ReloadContinuationItems } from "./services/chat/exports";
import { debugLog } from "./util";

export class Base {
  public videoId!: string;
  protected apiKey!: string;
  protected credentials?: Credentials;

  public metadata!: Metadata;
  public continuation!: ReloadContinuationItems;
  protected isReplay!: boolean;
  protected liveChatContext?: LiveChatContext;

  protected get(input: string, init?: RequestInit) {
    if (!input.startsWith("http")) {
      input = DEFAULT_ORIGIN + input;
    }
    const parsedUrl = new URL(input);

    if (!parsedUrl.searchParams.has("key")) {
      parsedUrl.searchParams.append("key", this.apiKey);
    }

    const authHeaders = buildAuthHeaders(this.credentials);
    const headers = {
      ...DEFAULT_HEADERS,
      ...authHeaders,
      ...init?.headers,
    };

    debugLog("GET", parsedUrl.toString());

    return fetch(parsedUrl.toString(), {
      ...init,
      headers,
    });
  }

  protected post(input: string, init?: RequestInit) {
    if (!input.startsWith("http")) {
      input = DEFAULT_ORIGIN + input;
    }
    const parsedUrl = new URL(input);

    if (!parsedUrl.searchParams.has("key")) {
      parsedUrl.searchParams.append("key", this.apiKey);
    }

    const authHeaders = buildAuthHeaders(this.credentials);
    const headers = {
      ...DEFAULT_HEADERS,
      ...authHeaders,
      ...init?.headers,
      "Content-Type": "application/json",
    };

    debugLog("POST", parsedUrl.toString(), init?.body);

    return fetch(parsedUrl.toString(), {
      ...init,
      method: "POST",
      headers,
    });
  }
}
