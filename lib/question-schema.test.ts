import { describe, expect, it } from "vitest";
import { demoPack } from "./demo";
import { validateQuestionPack } from "./question-schema";

function generatedInput() {
  return {
    title: demoPack.title,
    summary: demoPack.summary,
    topics: demoPack.topics,
    questions: demoPack.questions,
  };
}

describe("question pack validation", () => {
  it("accepts a grounded, unique question pack", () => {
    const parsed = validateQuestionPack(generatedInput(), "notes.pdf");
    expect(parsed.sourceName).toBe("notes.pdf");
    expect(parsed.generatedBy).toBe("openai");
    expect(parsed.questions).toHaveLength(6);
  });

  it("rejects duplicate prompts", () => {
    const input = generatedInput();
    input.questions = input.questions.map((question) => ({ ...question }));
    input.questions[1].prompt = input.questions[0].prompt;
    expect(() => validateQuestionPack(input, "notes.pdf")).toThrow(/duplicate questions/i);
  });

  it("rejects duplicate question IDs", () => {
    const input = generatedInput();
    input.questions = input.questions.map((question) => ({ ...question }));
    input.questions[1].id = input.questions[0].id;
    expect(() => validateQuestionPack(input, "notes.pdf")).toThrow(/duplicate IDs/i);
  });

  it("rejects missing evidence", () => {
    const input = generatedInput();
    input.questions = input.questions.map((question) => ({ ...question, evidence: { ...question.evidence } }));
    input.questions[0].evidence.quote = "";
    expect(() => validateQuestionPack(input, "notes.pdf")).toThrow();
  });

  it("rejects repeated choices", () => {
    const input = generatedInput();
    input.questions = input.questions.map((question) => ({ ...question, choices: [...question.choices] as typeof question.choices }));
    input.questions[0].choices[2] = input.questions[0].choices[0];
    expect(() => validateQuestionPack(input, "notes.pdf")).toThrow(/duplicate answer choices/i);
  });
});
