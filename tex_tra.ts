export type TranslateResponse = {
  code: number;
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
  result?: {
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
};

export type LangDetectResponse = {
  code: number;
  message: string;
  request?: { url: string; text: string };
  result?: { langdetect: { [k: string]: { lang: string; rate: number } } };
};

const BASE_URL = "https://mt-auto-minhon-mlt.ucri.jgn-x.jp";
const AUTH_URL = `${BASE_URL}/oauth2/token.php`;
const API_URL = `${BASE_URL}/api/`;

/**
 * TexTra API Client for Deno
 *
 * @example
 * ```ts
 *  import { TexTra } from "https://deno.land/x/tex_tra/tex_tra.ts";
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

  /**
   * Create TexTra API Client
   * @param name - User name
   * @param key - API key
   * @param secret - API secret
   * @example
   * ```ts
   *  import { TexTra } from "https://deno.land/x/tex_tra/tex_tra.ts";
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
   *  import { TexTra } from "https://deno.land/x/tex_tra/tex_tra.ts";
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
  async translate(
    text: string,
    apiName: string,
    apiParam: string,
  ): Promise<TranslateResponse> {
    return await this.request(text, apiName, apiParam);
  }

  /**
   * Detect language
   * @param text - Text to detect language
   * @returns Language detection API result
   */
  async langDetect(text: string): Promise<LangDetectResponse> {
    return await this.request(text, "langdetect");
  }

  private async auth() {
    const body = new FormData();
    body.append("grant_type", "client_credentials");
    body.append("client_id", this.key);
    body.append("client_secret", this.secret);
    body.append("urlAccessToken", AUTH_URL);

    const response = await fetch(AUTH_URL, { method: "POST", body });
    const { access_token, expires_in } = await response.json();
    this.token = access_token;
    this.expire = Date.now() + expires_in;
  }

  private async request(
    text: string,
    apiName: string,
    apiParam?: string,
    options: Record<string, string | number> = {},
  ) {
    if (!this.token || this.expire < Date.now()) {
      await this.auth();
    }
    const body = new FormData();
    body.append("access_token", this.token);
    body.append("key", this.key);
    body.append("api_name", apiName);
    if (apiParam) {
      body.append("api_param", apiParam);
    }
    body.append("name", this.name);
    body.append("type", "json");
    body.append("text", text);
    for (const [key, value] of Object.entries(options)) {
      body.append(key, value.toString());
    }

    const response = await fetch(API_URL, { method: "POST", body });
    return (await response.json()).resultset;
  }
}
