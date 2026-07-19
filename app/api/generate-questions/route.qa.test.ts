// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { POST } from "./route";

const originalKey = process.env.OPENAI_API_KEY;

afterEach(() => {
  process.env.OPENAI_API_KEY = originalKey;
});

describe("question generation release guards", () => {
  it("rejects a request without a file when OpenAI is configured", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const response = await POST(new Request("http://localhost/api/generate-questions", {
      method: "POST",
      body: new FormData(),
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: expect.stringMatching(/choose a PDF/i) });
  });

  it("rejects a PDF above 15 MB before reading or sending it", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const form = new FormData();
    form.append("file", new File([new Uint8Array(15 * 1024 * 1024 + 1)], "large.pdf", {
      type: "application/pdf",
    }));

    const response = await POST(new Request("http://localhost/api/generate-questions", {
      method: "POST",
      body: form,
    }));

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toMatchObject({ error: expect.stringMatching(/15 MB/i) });
  });
});
