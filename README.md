# deno-tex-tra

TexTra API Client for Deno.

https://mt-auto-minhon-mlt.ucri.jgn-x.jp/content/api/

## Usage

```ts
import { TexTra } from "https://deno.land/x/tex_tra/tex_tra.ts";

const name = "your_name";
const key = "your_key";
const secret = "your_secret";
const texTra = new TexTra({ name, key, secret });
try {
  const res = await texTra.translate("Hello", "mt", "generalNT_en_ja");
  console.log(res.result?.text);
  // => こんにちは
} catch (e) {
  console.log(e);
}
```

### How to get the arguments for translate()

`translate()` requires three arguments: the text to translate, API name and API
parameter.

API name and API parameter are in tail of the Request URL.

For example, `General - NT 【English - Japanese】` API, the Request URL is
following:

```
https://mt-auto-minhon-mlt.ucri.jgn-x.jp/api/mt/generalNT_en_ja/
```

then, API name is `"mt"`, API parameter is `"generalNT_en_ja"`.

If you only use generalNT API, you can use the wrapper like below:

```ts
function translate(text: string, from: string, to: string) {
  const apiParam = `generalNT_${from}_${to}`;
  const res = await texTra.translate("Hello", "mt", apiParam);
  return res.result?.text;
}
```

## Author

[kawarimidoll](https://github.com/kawarimidoll)

## License

MIT
