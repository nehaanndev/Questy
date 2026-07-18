import type { BattleState, QuestQuestion } from "./types";

export const initialBattleState = (): BattleState => ({
  questionIndex: 0,
  playerHp: 100,
  enemyHp: 100,
  breakMeter: 0,
  actionSegments: 0,
  correctCount: 0,
  answers: [],
  status: "playing",
});

export function resolveAnswer(
  state: BattleState,
  question: QuestQuestion,
  selectedIndex: number,
  questionCount: number,
): BattleState {
  if (state.status !== "playing") return state;

  const correct = selectedIndex === question.correctIndex;
  const power = question.difficulty === "challenge" ? 28 : question.difficulty === "apply" ? 24 : 20;
  const nextEnemyHp = Math.max(0, state.enemyHp - (correct ? power : 0));
  const nextPlayerHp = Math.max(0, state.playerHp - (correct ? 0 : 18));
  const nextBreak = Math.max(0, Math.min(100, state.breakMeter + (correct ? 24 : -12)));
  const isLast = state.questionIndex >= questionCount - 1;
  const finalCorrectCount = state.correctCount + (correct ? 1 : 0);
  const status = nextPlayerHp === 0
    ? "lost"
    : isLast
      ? finalCorrectCount >= Math.ceil(questionCount / 2)
        ? "won"
        : "lost"
      : "playing";

  return {
    ...state,
    questionIndex: isLast ? state.questionIndex : state.questionIndex + 1,
    playerHp: nextPlayerHp,
    enemyHp: status === "won" ? 0 : Math.max(1, nextEnemyHp),
    breakMeter: nextBreak,
    actionSegments: Math.min(3, state.actionSegments + (correct ? 1 : 0)),
    correctCount: finalCorrectCount,
    answers: [...state.answers, { questionId: question.id, selectedIndex, correct }],
    status,
  };
}
