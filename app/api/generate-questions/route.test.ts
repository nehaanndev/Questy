// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { POST } from "./route";

const originalKey = process.env.OPENAI_API_KEY;

afterEach(() => {
  process.env.OPENAI_API_KEY = originalKey;
});

describe("question generation route guards", () => {
  it("keeps the API unavailable when the server key is missing", async () => {
    delete process.env.OPENAI_API_KEY;
    const response = await POST(new Request("http://localhost/api/generate-questions", { method: "POST", body: new FormData() }));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ error: expect.stringMatching(/not configured/i) });
  });

  it("rejects non-PDF uploads before contacting OpenAI", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const form = new FormData();
    form.append("file", new File(["hello"], "notes.txt", { type: "text/plain" }));
    const response = await POST(new Request("http://localhost/api/generate-questions", { method: "POST", body: form }));
    expect(response.status).toBe(415);
    await expect(response.json()).resolves.toMatchObject({ error: expect.stringMatching(/PDF/i) });
  });

  it("rejects empty PDFs", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const form = new FormData();
    form.append("file", new File([], "empty.pdf", { type: "application/pdf" }));
    const response = await POST(new Request("http://localhost/api/generate-questions", { method: "POST", body: form }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: expect.stringMatching(/empty/i) });
  });

  it("rejects renamed files that do not have a PDF signature", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const form = new FormData();
    form.append("file", new File(["not really a pdf"], "disguise.pdf", { type: "application/pdf" }));
    const response = await POST(new Request("http://localhost/api/generate-questions", { method: "POST", body: form }));
    expect(response.status).toBe(415);
    await expect(response.json()).resolves.toMatchObject({ error: expect.stringMatching(/signature/i) });
  });
});
