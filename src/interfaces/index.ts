export * from "./actions";
export * from "./context";
export * from "./contextActions";
export * from "./misc";
export * from "./yt";

export interface Credentials {
  SAPISID: string;
  APISID: string;
  HSID: string;
  SID: string;
  SSID: string;

  /**
   * @deprecated Use DELEGATED_SESSION_ID
   */
  SESSION_ID?: string;

  /**
   * Delegated session id for brand account
   */
  DELEGATED_SESSION_ID?: string;
}
