import { Base } from "../../base";
import { AccessDeniedError } from "../../error";
import { parseMetadataFromEmbed, parseMetadataFromWatch } from "./parser";

export interface ContextService extends Base {}

export class ContextService {
  public async populateMetadata(): Promise<void> {
    const metadata = await this.fetchMetadataFromWatch(this.videoId);

    this.title = metadata.title;
    this.channelId = metadata.channelId;
    this.channelName = metadata.channelName;
    this.isLive = metadata.isLive;
  }

  async fetchMetadataFromWatch(id: string) {
    const res = await this.get("/watch?v=" + this.videoId);

    // Check ban status
    if (res.status === 429) {
      throw new AccessDeniedError("Rate limit exceeded: " + this.videoId);
    }

    const html = await res.text();
    return parseMetadataFromWatch(html);
  }

  async fetchMetadataFromEmbed(id: string) {
    const res = await this.get(`/embed/${id}`);

    if (res.status === 429)
      throw new AccessDeniedError("Rate limit exceeded: " + id);

    const html = await res.text();
    return parseMetadataFromEmbed(html);
  }
}
