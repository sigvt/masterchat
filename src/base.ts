import fetch from "cross-fetch";
import { buildAuthHeaders, Credentials } from "./auth";
import { DEFAULT_HEADERS, DEFAULT_ORIGIN } from "./constants";
import { ReloadContinuationItems } from "./services/chat/exports";
import { LiveChatContext, Metadata } from "./services/context/exports";
import { debugLog, timeoutThen } from "./util";

export type RequestInitWithRetryOption = RequestInit & {
  retry?: number;
  retryInterval?: number;
};

export class Base {
  public videoId!: string;
  protected apiKey!: string;
  protected credentials?: Credentials;

  public metadata!: Metadata;
  public continuation!: ReloadContinuationItems;
  protected isReplay!: boolean;
  // protected liveChatContext!: LiveChatContext;

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

    // debugLog("GET", parsedUrl.toString());

    return fetch(parsedUrl.toString(), {
      ...init,
      headers,
    });
  }

  protected async postJson<T>(
    input: string,
    init?: RequestInitWithRetryOption
  ): Promise<T> {
    const errors = [];

    let remaining = init?.retry ?? 0;
    const retryInterval = init?.retryInterval ?? 1000;

    while (true) {
      try {
        const res = await this.post(input, init);
        return await res.json();
      } catch (err) {
        if (err.name === "AbortError") throw err;

        errors.push(err);

        if (remaining > 0) {
          await timeoutThen(retryInterval);
          remaining -= 1;
          debugLog("postJson failed: retry remaining " + remaining);
          continue;
        }

        err.errors = errors;
        throw err;
      }
    }
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

    // debugLog("POST", parsedUrl.toString(), init?.body);

    return fetch(parsedUrl.toString(), {
      ...init,
      method: "POST",
      headers,
    });
  }
}
