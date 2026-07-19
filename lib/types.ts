export type Difficulty = "recall" | "apply" | "challenge";

export type SourceEvidence = {
  pageLabel: string;
  quote: string;
};

export type QuestQuestion = {
  id: string;
  prompt: string;
  choices: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  evidence: SourceEvidence;
  difficulty: Difficulty;
  topic: string;
};

export type QuestionPack = {
  title: string;
  summary: string;
  sourceName: string;
  topics: string[];
  questions: QuestQuestion[];
  generatedBy: "demo" | "openai";
};

export type BattleState = {
  questionIndex: number;
  playerHp: number;
  enemyHp: number;
  breakMeter: number;
  actionSegments: number;
  correctCount: number;
  answers: Array<{
    questionId: string;
    selectedIndex: number;
    correct: boolean;
  }>;
  status: "playing" | "won" | "lost";
};
