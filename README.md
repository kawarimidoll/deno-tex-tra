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

## API coverage

This is not a TODO list, just an indication of the current state of support.
This project is not intended to support all APIs.

- [x] mt/lang_id
- [x] mt_standard/get
- [ ] mt_adapt/set
- [ ] mt_adapt/update
- [x] mt_adapt/get
- [ ] mt_adapt/delete
- [ ] mt_custom/set
- [ ] mt_custom/update
- [x] mt_custom/get
- [ ] mt_custom/delete
- [x] mt_share/get
- [ ] term_root/set
- [ ] term_root/update
- [x] term_root/get
- [ ] term_root/delete
- [ ] term/set
- [ ] term/set_file
- [ ] term/update
- [ ] term/search
- [ ] term/delete
- [ ] bilingual_root/set
- [ ] bilingual_root/update
- [x] bilingual_root/get
- [ ] bilingual_root/delete
- [ ] bilingual/set
- [ ] bilingual/set_file
- [ ] bilingual/update
- [ ] bilingual/search
- [ ] bilingual/delete
- [ ] regex_root/set
- [ ] regex_root/update
- [x] regex_root/get
- [ ] regex_root/delete
- [ ] regex/set
- [ ] regex/set_file
- [ ] regex/update
- [ ] regex/search
- [ ] regex/delete
- [ ] lookup
- [ ] sim
- [ ] simCalc
- [x] split
- [x] langdetect
- [ ] trans_file/set
- [ ] trans_file/status
- [ ] trans_file/get
- [ ] exterm/set
- [ ] exterm/status
- [ ] exterm/get
- [ ] alignment/set
- [ ] alignment/status
- [ ] alignment/get
- [ ] doc/set
- [ ] doc/list
- [ ] doc/get

## Author

[kawarimidoll](https://github.com/kawarimidoll)

## License

MIT
