export type TexTraResponse = {
  code:
    | 0
    | 500
    | 501
    | 502
    | 504
    | 505
    | 510
    | 511
    | 520
    | 521
    | 522
    | 523
    | 524
    | 525
    | 530
    | 531
    | 532
    | 533;
  message: string;
  request?: {
    url: string;
    text: string;
    split: number;
    history: number;
    xml: unknown;
    term_id: string;
    bilingual_id: string;
    log_use: number;
    editor_use: number;
    data: unknown;
  };
  result?: Result;
};
type Result = {
  text: string;
  blank: 0 | 1;
  information?: {
    "text-s": string;
    "text-t": string;
    sentence: {
      "text-s": string;
      "text-t": string;
      split: {
        "text-s": string;
        "text-t": string;
        process: {
          regex: {
            text: string;
            result: string;
            pattern: string;
            replace: string;
          }[];
          "replace-before": {
            "text-s": string;
            "text-t": string;
            "term-s": string;
            "term-t": string;
          }[];
          "short-before": unknown;
          preprocess: unknown;
          translate: {
            reverse: {
              selected: 0 | 1;
              "id-n": string;
              "id-r": string;
              "name-n": string;
              "name-r": string;
              "text-s": string;
              "text-t": string;
              "text-r": string;
              score: number;
            }[];
            specification: unknown;
            "text-s": string;
            "src-token": unknown;
            "text-t": string;
            associate: unknown;
            oov: unknown;
            exception: string;
            associates: unknown;
          };
          "short-after": unknown;
          "regex-after": unknown;
          "replace-after": {
            "text-s": string;
            "text-t": string;
            "term-s": string;
            "term-t": string;
          }[];
        };
      }[];
    }[];
  };
};

const BASE_URL = "https://mt-auto-minhon-mlt.ucri.jgn-x.jp";
const AUTH_URL = `${BASE_URL}/oauth2/token.php`;
const API_URL = `${BASE_URL}/api/`;

/**
 * TexTra API Client for Deno
 *
 * @example
 * ```ts
 *  const name = "your_name";
 *  const key = "your_key";
 *  const secret = "your_secret";
 *  const texTra = new TexTra({ name, key, secret });
 *  try {
 *    const res = await texTra.translate("Hello", "mt", "generalNT_en_ja");
 *    console.log(res.result?.text);
 *  } catch (e) {
 *    console.log(e);
 *  }
 * ```
 */
export class TexTra {
  private expire = 0;
  private name: string;
  private key: string;
  private secret: string;
  private token = "";
  private decoder = new TextDecoder();

  /**
   * Create TexTra API Client
   * @param name - User name
   * @param key - API key
   * @param secret - API secret
   * @example
   * ```ts
   *  const name = "your_name";
   *  const key = "your_key";
   *  const secret = "your_secret";
   *  const texTra = new TexTra({ name, key, secret });
   *  try {
   *    const res = await texTra.translate("Hello", "mt", "generalNT_en_ja");
   *    console.log(res.result?.text);
   *  } catch (e) {
   *    console.log(e);
   *  }
   * ```
   */
  constructor(
    { name, key, secret }: { name: string; key: string; secret: string },
  ) {
    this.name = name;
    this.key = key;
    this.secret = secret;
  }

  /**
   * Translate text
   * @param text - Text to translate
   * @param apiName - API name like "mt"
   * @param apiParam - API parameter like "generalNT_en_ja"
   * @returns Translation API result
   * @example
   * ```ts
   *  const name = "your_name";
   *  const key = "your_key";
   *  const secret = "your_secret";
   *  const texTra = new TexTra({ name, key, secret });
   *  try {
   *    const res = await texTra.translate("Hello", "mt", "generalNT_en_ja");
   *    console.log(res.result?.text);
   *  } catch (e) {
   *    console.log(e);
   *  }
   * ```
   */
  async translate(text: string, apiName: string, apiParam: string) {
    if (!this.token || this.expire < Date.now()) {
      await this.auth();
    }
    return this.request(text, apiName, apiParam);
  }

  private async auth() {
    const body = new FormData();
    body.append("grant_type", "client_credentials");
    body.append("client_id", this.key);
    body.append("client_secret", this.secret);
    body.append("urlAccessToken", AUTH_URL);

    const response = await fetch(AUTH_URL, { method: "POST", body });
    if (!response?.body) {
      throw new Error("OAuth2 Error. API response data is empty.");
    }

    const responseBody = await response.body.getReader().read();
    if (!responseBody) {
      throw new Error("OAuth2 Error. API response data is empty.");
    }

    const value = JSON.parse(this.decoder.decode(responseBody.value));
    this.token = value.access_token;
    this.expire = Date.now() + value.expires_in;
  }

  private async request(
    text: string,
    apiName: string,
    apiParam: string,
  ): Promise<TexTraResponse> {
    const body = new FormData();
    body.append("access_token", this.token);
    body.append("key", this.key);
    body.append("api_name", apiName);
    body.append("api_param", apiParam);
    body.append("name", this.name);
    body.append("type", "json");
    body.append("text", text);

    const response = await fetch(API_URL, { method: "POST", body });
    if (!response.body) {
      throw new Error("Translate Error. API response data is empty.");
    }

    const responseBody = await response.body.getReader().read();
    if (!responseBody) {
      throw new Error("Translate Error. API response data is empty.");
    }

    return JSON.parse(this.decoder.decode(responseBody.value)).resultset;
  }
}
