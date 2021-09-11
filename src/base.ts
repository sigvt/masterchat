import fetch from "cross-fetch";
import { buildAuthHeaders, Credentials } from "./auth";
import { DEFAULT_HEADERS, DEFAULT_ORIGIN } from "./constants";
import { debugLog, timeoutThen } from "./utils";

export type RequestInitWithRetryOption = RequestInit & {
  retry?: number;
  retryInterval?: number;
};

export class Base {
  public isLive?: boolean;
  public videoId!: string;
  public channelId!: string;
  public channelName?: string;
  public title?: string;
  protected credentials?: Credentials;
  protected sessionId?: string;
  protected apiKey!: string;

  protected async postWithRetry<T>(
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
        if (err instanceof Error) {
          if (err.name === "AbortError") throw err;

          errors.push(err);

          if (remaining > 0) {
            await timeoutThen(retryInterval);
            remaining -= 1;
            debugLog(
              `Retrying(postJson) remaining=${remaining} after=${retryInterval}`
            );
            continue;
          }

          (err as any).errors = errors;
        }
        throw err;
      }
    }
  }

  protected async post(input: string, init?: RequestInit): Promise<Response> {
    if (!input.startsWith("http")) {
      input = DEFAULT_ORIGIN + input;
    }
    const parsedUrl = new URL(input);

    if (!parsedUrl.searchParams.has("key")) {
      parsedUrl.searchParams.append("key", this.apiKey);
    }

    const requestUrl = parsedUrl.toString();
    const requestInit = {
      ...init,
      method: "POST",
      headers: {
        ...DEFAULT_HEADERS,
        ...buildAuthHeaders(this.credentials, this.sessionId),
        ...init?.headers,
        "Content-Type": "application/json",
      },
    };
    const res = await fetch(requestUrl, requestInit);

    if (res.status !== 200) {
      debugLog(
        `post(${this.videoId}):`,
        `${requestUrl} status=${res.status} ${JSON.stringify(requestInit)}`
      );
    }

    return res;
  }

  protected get(input: string, init?: RequestInit) {
    if (!input.startsWith("http")) {
      input = DEFAULT_ORIGIN + input;
    }

    const requestInit = {
      ...init,
      headers: {
        ...DEFAULT_HEADERS,
        ...buildAuthHeaders(this.credentials),
        ...init?.headers,
      },
    };

    return fetch(input, requestInit);
  }

  protected log(label: string, ...obj: any) {
    debugLog(`${label}(${this.videoId}):`, ...obj);
  }

  protected cvPair() {
    return {
      channelId: this.channelId,
      videoId: this.videoId,
    };
  }
}
