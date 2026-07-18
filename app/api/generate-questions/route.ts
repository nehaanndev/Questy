import OpenAI from "openai";
import { NextResponse } from "next/server";
import { questionPackJsonSchema, validateQuestionPack } from "@/lib/question-schema";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 3;
const uploadAttempts = new Map<string, { count: number; resetAt: number }>();

function clientAddress(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "local";
}

function rateLimitResponse(request: Request) {
  const now = Date.now();
  const key = clientAddress(request);
  const current = uploadAttempts.get(key);

  if (!current || current.resetAt <= now) {
    uploadAttempts.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return null;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return NextResponse.json(
      { error: "You have created several realms recently. Try again in a few minutes." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((current.resetAt - now) / 1000)) },
      },
    );
  }

  current.count += 1;
  return null;
}

const generationPrompt = `You create source-grounded study questions for a fantasy learning game.

Read the attached PDF carefully, including handwriting, diagrams, tables, and labels. Create exactly six multiple-choice questions that can be answered using only the PDF.

Grounding requirements:
- Every correct answer must be directly supported by a short verbatim evidence quote from the PDF.
- The pageLabel must identify the page where that evidence appears (for example "page 2").
- Never use outside knowledge as if it appeared in the document.
- If a passage is unclear, do not create a question from it.
- Distractors must be plausible but clearly incorrect based on the source.
- Explanations may clarify the cited material but must not introduce unsupported facts.
- Cover several distinct topics from the document and use a mix of recall, application, and challenge questions.
- Keep wording concise and appropriate for a teen learner.
- IDs must be unique, lowercase, and hyphenated.

Return only the requested structured question pack.`;

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI is not configured. Add OPENAI_API_KEY to the server environment." },
        { status: 503 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose a PDF to build a realm." }, { status: 400 });
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      return NextResponse.json({ error: "Questling currently accepts PDF files only." }, { status: 415 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "That PDF is empty." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "PDFs must be 15 MB or smaller for this prototype." }, { status: 413 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.subarray(0, 5).toString("ascii") !== "%PDF-") {
      return NextResponse.json(
        { error: "That file does not contain a valid PDF signature." },
        { status: 415 },
      );
    }

    const limited = rateLimitResponse(request);
    if (limited) return limited;

    const fileData = `data:application/pdf;base64,${bytes.toString("base64")}`;
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 110_000,
      maxRetries: 1,
    });

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-5.6-terra",
      reasoning: { effort: "none" },
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_file",
              filename: file.name,
              file_data: fileData,
              detail: "high",
            },
            { type: "input_text", text: generationPrompt },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "questling_question_pack",
          strict: true,
          schema: questionPackJsonSchema,
        },
      },
    });

    if (!response.output_text) {
      throw new Error("OpenAI returned no question pack.");
    }

    const pack = validateQuestionPack(JSON.parse(response.output_text), file.name);
    return NextResponse.json({ pack });
  } catch (error) {
    console.error("Question generation failed", error instanceof Error ? error.message : error);

    const message = error instanceof Error ? error.message : "Question generation failed.";
    const isRateLimit = message.includes("429") || message.toLowerCase().includes("rate limit");
    const isAuth = message.includes("401") || message.toLowerCase().includes("api key");

    return NextResponse.json(
      {
        error: isRateLimit
          ? "The question forge is busy. Wait a moment and try again."
          : isAuth
            ? "The OpenAI API key was rejected. Check the server configuration."
            : "We could not build a reliable question pack from that PDF. Try a clearer or smaller file.",
        detail: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: isRateLimit ? 429 : isAuth ? 503 : 500 },
    );
  }
}
