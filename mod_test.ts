import { assertEquals, assertRejects } from "@std/assert";
import { assertSpyCalls, stub } from "@std/testing/mock";
import { TexTra } from "./mod.ts";

function mockFetch(responses: { ok: boolean; body: unknown }[]) {
  let callIndex = 0;
  return stub(globalThis, "fetch", () => {
    const res = responses[callIndex++];
    return Promise.resolve(
      new Response(JSON.stringify(res.body), {
        status: res.ok ? 200 : 500,
        headers: { "Content-Type": "application/json" },
      }),
    );
  });
}

const authResponse = {
  ok: true,
  body: { access_token: "test_token", expires_in: 3600000 },
};

function createClient(): TexTra {
  return new TexTra({ name: "user", key: "key", secret: "secret" });
}

Deno.test("translate() returns translation result", async () => {
  const resultset = {
    code: 0,
    message: "",
    result: { text: "こんにちは", blank: 0 },
  };
  const fetchStub = mockFetch([
    authResponse,
    { ok: true, body: { resultset } },
  ]);
  try {
    const client = createClient();
    const res = await client.translate("Hello", "mt", "generalNT_en_ja");
    assertEquals(res.code, 0);
    assertEquals(res.result?.text, "こんにちは");
    assertSpyCalls(fetchStub, 2);
  } finally {
    fetchStub.restore();
  }
});

Deno.test("langDetect() returns detection result", async () => {
  const resultset = {
    code: 0,
    message: "",
    result: { langdetect: { "0": { lang: "en", rate: 1.0 } } },
  };
  const fetchStub = mockFetch([
    authResponse,
    { ok: true, body: { resultset } },
  ]);
  try {
    const client = createClient();
    const res = await client.langDetect("Hello");
    assertEquals(res.result?.langdetect["0"].lang, "en");
  } finally {
    fetchStub.restore();
  }
});

Deno.test("split() returns split result", async () => {
  const resultset = {
    code: 0,
    message: "",
    result: { text: ["Hello.", "World."] },
  };
  const fetchStub = mockFetch([
    authResponse,
    { ok: true, body: { resultset } },
  ]);
  try {
    const client = createClient();
    const res = await client.split("Hello. World.", "en");
    assertEquals(res.result?.text, ["Hello.", "World."]);
  } finally {
    fetchStub.restore();
  }
});

Deno.test("listAcquisition() returns list result", async () => {
  const resultset = {
    code: 0,
    message: "",
    result: { list: [{ id: 1 }] },
  };
  const fetchStub = mockFetch([
    authResponse,
    { ok: true, body: { resultset } },
  ]);
  try {
    const client = createClient();
    const res = await client.listAcquisition("mt_standard");
    assertEquals(res.result?.list[0].id, 1);
  } finally {
    fetchStub.restore();
  }
});

Deno.test("throws on auth failure", async () => {
  const fetchStub = mockFetch([
    { ok: false, body: {} },
  ]);
  try {
    const client = createClient();
    await assertRejects(
      () => client.translate("Hello", "mt", "generalNT_en_ja"),
      Error,
      "Auth failed",
    );
  } finally {
    fetchStub.restore();
  }
});

Deno.test("throws on API request failure", async () => {
  const fetchStub = mockFetch([
    authResponse,
    { ok: false, body: {} },
  ]);
  try {
    const client = createClient();
    await assertRejects(
      () => client.translate("Hello", "mt", "generalNT_en_ja"),
      Error,
      "API request failed",
    );
  } finally {
    fetchStub.restore();
  }
});

Deno.test("reuses token for subsequent requests", async () => {
  const resultset = { code: 0, message: "" };
  const fetchStub = mockFetch([
    authResponse,
    { ok: true, body: { resultset } },
    { ok: true, body: { resultset } },
  ]);
  try {
    const client = createClient();
    await client.langDetect("Hello");
    await client.langDetect("World");
    // auth is called once, then 2 API calls = 3 total
    assertSpyCalls(fetchStub, 3);
  } finally {
    fetchStub.restore();
  }
});
