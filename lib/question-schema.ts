import { z } from "zod";
import type { QuestionPack } from "./types";

export const generatedQuestionPackSchema = z.object({
  title: z.string().min(3).max(100),
  summary: z.string().min(10).max(500),
  topics: z.array(z.string().min(2).max(80)).min(1).max(12),
  questions: z
    .array(
      z.object({
        id: z.string().min(1).max(80),
        prompt: z.string().min(8).max(280),
        choices: z.tuple([
          z.string().min(1).max(180),
          z.string().min(1).max(180),
          z.string().min(1).max(180),
          z.string().min(1).max(180),
        ]),
        correctIndex: z.number().int().min(0).max(3),
        explanation: z.string().min(10).max(500),
        evidence: z.object({
          pageLabel: z.string().min(1).max(60),
          quote: z.string().min(5).max(500),
        }),
        difficulty: z.enum(["recall", "apply", "challenge"]),
        topic: z.string().min(2).max(80),
      }),
    )
    .min(4)
    .max(10),
});

export function validateQuestionPack(input: unknown, sourceName: string): QuestionPack {
  const parsed = generatedQuestionPackSchema.parse(input);
  const uniquePrompts = new Set(parsed.questions.map((question) => question.prompt.trim().toLowerCase()));
  const uniqueIds = new Set(parsed.questions.map((question) => question.id.trim().toLowerCase()));

  if (uniqueIds.size !== parsed.questions.length) {
    throw new Error("The generated question pack contained duplicate IDs.");
  }

  if (uniquePrompts.size !== parsed.questions.length) {
    throw new Error("The generated question pack contained duplicate questions.");
  }

  for (const question of parsed.questions) {
    const normalizedChoices = question.choices.map((choice) => choice.trim().toLowerCase());
    if (new Set(normalizedChoices).size !== normalizedChoices.length) {
      throw new Error(`Question ${question.id} contained duplicate answer choices.`);
    }
  }

  return {
    ...parsed,
    sourceName,
    generatedBy: "openai",
  };
}

export const questionPackJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "summary", "topics", "questions"],
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    topics: {
      type: "array",
      minItems: 1,
      maxItems: 12,
      items: { type: "string" },
    },
    questions: {
      type: "array",
      minItems: 6,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "id",
          "prompt",
          "choices",
          "correctIndex",
          "explanation",
          "evidence",
          "difficulty",
          "topic",
        ],
        properties: {
          id: { type: "string" },
          prompt: { type: "string" },
          choices: {
            type: "array",
            minItems: 4,
            maxItems: 4,
            items: { type: "string" },
          },
          correctIndex: { type: "integer", minimum: 0, maximum: 3 },
          explanation: { type: "string" },
          evidence: {
            type: "object",
            additionalProperties: false,
            required: ["pageLabel", "quote"],
            properties: {
              pageLabel: { type: "string" },
              quote: { type: "string" },
            },
          },
          difficulty: { type: "string", enum: ["recall", "apply", "challenge"] },
          topic: { type: "string" },
        },
      },
    },
  },
} as const;
