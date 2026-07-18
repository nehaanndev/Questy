# Questling vertical slice

Questling turns study PDFs into a source-grounded fantasy quest. This prototype implements one complete loop:

1. Upload a PDF or open the supplied environmental-science demo.
2. Generate six questions with the OpenAI Responses API.
3. Explore a realm with a keyboard/touch-movable avatar and following companion.
4. Power battle actions by answering questions.
5. Open the cited evidence during combat.
6. Review every answer and citation after the encounter.

## Run locally

```bash
npm install
cp .env.example .env.local
# Set OPENAI_API_KEY in .env.local
npm run dev
```

Open `http://localhost:3000`.

The demo realm does not require an API call. Uploading a PDF requires `OPENAI_API_KEY`. `OPENAI_MODEL` defaults to `gpt-5.6-terra` and can be changed in the server environment.

## Verification

```bash
npm test
npm run build
npm run smoke:upload -- /absolute/path/to/notes.pdf
```

The smoke command performs a real OpenAI API request and may incur usage charges.

## OpenAI integration

The server route at `app/api/generate-questions/route.ts`:

- accepts only non-empty PDFs up to 15 MB and verifies the `%PDF-` file signature;
- limits each client address to three generated realms per 15 minutes;
- keeps the API key server-side;
- sends the PDF through the Responses API as a high-detail `input_file`;
- requests a strict JSON-schema response;
- validates it again with Zod;
- rejects duplicate IDs, prompts, and answer choices;
- requires a page label and short evidence quote for every question;
- enforces a 110-second client timeout with one retry.

OpenAI's file-input documentation explains that PDF inputs include extracted text and page images, which is important for handwritten scans and diagrams: <https://developers.openai.com/api/docs/guides/file-inputs>. The Structured Outputs guide describes the JSON-schema response format used here: <https://developers.openai.com/api/docs/guides/structured-outputs>.

## Important prototype limits

- Generated packs persist in browser `localStorage`; there is not yet a database or account system.
- The included limiter is intentionally lightweight and process-local. Add account authentication and a shared rate-limit store before a public, multi-instance deployment.
- Uploaded PDF bytes are passed directly to OpenAI and are not stored by this app.
- The realm is a 2.5D interactive prototype, not a full 3D game engine.
- OCR confidence is enforced by prompting and evidence requirements, not a second independent OCR service.
- The model can still misread handwriting. Learners should be able to report questionable items before a production release.
