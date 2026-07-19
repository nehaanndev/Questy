import { describe, expect, it } from "vitest";
import { initialBattleState, resolveAnswer } from "./battle";
import { demoPack } from "./demo";

describe("battle resolution", () => {
  it("rewards a correct answer and advances once", () => {
    const question = demoPack.questions[0];
    const next = resolveAnswer(initialBattleState(), question, question.correctIndex, demoPack.questions.length);

    expect(next.questionIndex).toBe(1);
    expect(next.correctCount).toBe(1);
    expect(next.enemyHp).toBeLessThan(100);
    expect(next.playerHp).toBe(100);
    expect(next.breakMeter).toBe(24);
    expect(next.answers).toHaveLength(1);
  });

  it("damages the player after an incorrect answer without creating action charge", () => {
    const question = demoPack.questions[0];
    const next = resolveAnswer(initialBattleState(), question, 2, demoPack.questions.length);

    expect(next.playerHp).toBe(82);
    expect(next.enemyHp).toBe(100);
    expect(next.breakMeter).toBe(0);
    expect(next.actionSegments).toBe(0);
    expect(next.answers[0].correct).toBe(false);
  });

  it("keeps meters bounded and finishes a six-question all-correct battle", () => {
    let state = initialBattleState();
    for (const question of demoPack.questions) {
      state = resolveAnswer(state, question, question.correctIndex, demoPack.questions.length);
      if (state.status !== "playing") break;
    }

    expect(state.status).toBe("won");
    expect(state.enemyHp).toBe(0);
    expect(state.answers).toHaveLength(demoPack.questions.length);
    expect(state.breakMeter).toBeLessThanOrEqual(100);
    expect(state.actionSegments).toBeLessThanOrEqual(3);
  });

  it("does not resolve additional answers after the battle ends", () => {
    const ended = { ...initialBattleState(), status: "won" as const, enemyHp: 0 };
    expect(resolveAnswer(ended, demoPack.questions[0], 0, demoPack.questions.length)).toEqual(ended);
  });
});
