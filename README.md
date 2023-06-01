# deno-tex-tra

TexTra API Client for Deno.

```ts
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
