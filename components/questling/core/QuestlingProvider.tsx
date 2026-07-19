"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { initialBattleState, resolveAnswer } from "@/lib/battle";
import { demoPack } from "@/lib/demo";
import type { BattleState, QuestionPack } from "@/lib/types";
import { CREATURES, type Screen } from "./config";

type Settings = {
  motion: boolean;
  largeText: boolean;
  dyslexia: boolean;
  contrast: boolean;
  dialogue: number;
  music: number;
  controls: string;
};

type StateSetter<T> = Dispatch<SetStateAction<T>>;

export type QuestlingContextValue = {
  screen: Screen;
  previousGameScreen: Screen;
  pack: QuestionPack;
  uploadedName: string | null;
  sources: string[];
  processingStep: number;
  error: string | null;
  notice: string;
  avatarTab: string;
  avatarChoice: number;
  quest: string;
  tracked: boolean;
  clueSaved: boolean;
  sanctuaryMessage: string;
  bondLevel: number;
  codexTab: string;
  selectedCreature: number;
  team: number[];
  masteryTopic: string;
  wardrobeTab: string;
  wardrobeChoice: number;
  inventoryTab: string;
  selectedItem: string;
  settingsTab: string;
  settings: Settings;
  accountTab: string;
  sourceReviewed: boolean;
  confirmAction: string | null;
  battle: BattleState;
  selectedIndex: number | null;
  activeCommand: string;
  currentQuestion: QuestionPack["questions"][number];
  selectedCorrect: boolean;
  answerReview: Array<{ answer: BattleState["answers"][number]; question: QuestionPack["questions"][number] }>;
  navigate: (target: Screen) => void;
  openPause: () => void;
  beginDemo: () => void;
  startBattle: () => void;
  uploadPdf: (file: File) => Promise<void>;
  continueAfterAnswer: () => void;
  toggleTeam: (index: number) => void;
  setUploadedName: StateSetter<string | null>;
  setSources: StateSetter<string[]>;
  setProcessingStep: StateSetter<number>;
  setNotice: StateSetter<string>;
  setAvatarTab: StateSetter<string>;
  setAvatarChoice: StateSetter<number>;
  setQuest: StateSetter<string>;
  setTracked: StateSetter<boolean>;
  setClueSaved: StateSetter<boolean>;
  setSanctuaryMessage: StateSetter<string>;
  setBondLevel: StateSetter<number>;
  setCodexTab: StateSetter<string>;
  setSelectedCreature: StateSetter<number>;
  setMasteryTopic: StateSetter<string>;
  setWardrobeTab: StateSetter<string>;
  setWardrobeChoice: StateSetter<number>;
  setInventoryTab: StateSetter<string>;
  setSelectedItem: StateSetter<string>;
  setSettingsTab: StateSetter<string>;
  setSettings: StateSetter<Settings>;
  setAccountTab: StateSetter<string>;
  setSourceReviewed: StateSetter<boolean>;
  setConfirmAction: StateSetter<string | null>;
  setSelectedIndex: StateSetter<number | null>;
  setActiveCommand: StateSetter<string>;
};

const QuestlingContext = createContext<QuestlingContextValue | null>(null);

export function QuestlingProvider({ children }: { children: ReactNode }) {
  // First Steps is the durable home. Onboarding remains available from its home menu.
  const [screen, setScreen] = useState<Screen>("first-steps");
  const [previousGameScreen, setPreviousGameScreen] = useState<Screen>("first-steps");
  const [pack, setPack] = useState<QuestionPack>(demoPack);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const [sources, setSources] = useState(["Biology Notes.pdf", "World History.docx", "Algebra Review.pdf"]);
  const [processingStep, setProcessingStep] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState("Demo progress saved locally");
  const [avatarTab, setAvatarTab] = useState("Face");
  const [avatarChoice, setAvatarChoice] = useState(0);
  const [quest, setQuest] = useState("The Forgotten Archive");
  const [tracked, setTracked] = useState(true);
  const [clueSaved, setClueSaved] = useState(false);
  const [sanctuaryMessage, setSanctuaryMessage] = useState("Lumi is ready to explore.");
  const [bondLevel, setBondLevel] = useState(4);
  const [codexTab, setCodexTab] = useState("All");
  const [selectedCreature, setSelectedCreature] = useState(0);
  const [team, setTeam] = useState([0, 1, 2]);
  const [masteryTopic, setMasteryTopic] = useState("Mitochondria");
  const [wardrobeTab, setWardrobeTab] = useState("Outfits");
  const [wardrobeChoice, setWardrobeChoice] = useState(0);
  const [inventoryTab, setInventoryTab] = useState("Relics");
  const [selectedItem, setSelectedItem] = useState("Archive Key");
  const [settingsTab, setSettingsTab] = useState("Accessibility");
  const [settings, setSettings] = useState<Settings>({
    motion: false,
    largeText: false,
    dyslexia: false,
    contrast: true,
    dialogue: 68,
    music: 45,
    controls: "Mouse",
  });
  const [accountTab, setAccountTab] = useState("Profile");
  const [sourceReviewed, setSourceReviewed] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [battle, setBattle] = useState<BattleState>(initialBattleState);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeCommand, setActiveCommand] = useState("Ability");
  const uploadController = useRef<AbortController | null>(null);

  const currentQuestion = pack.questions[battle.questionIndex] ?? pack.questions[0];
  const selectedCorrect = selectedIndex !== null && selectedIndex === currentQuestion.correctIndex;
  const answerReview = useMemo(
    () => battle.answers.flatMap((answer) => {
      const question = pack.questions.find((item) => item.id === answer.questionId);
      return question ? [{ answer, question }] : [];
    }),
    [battle.answers, pack.questions],
  );

  function navigate(target: Screen) {
    if (target !== screen) setScreen(target);
  }

  function openPause() {
    setPreviousGameScreen(screen);
    setScreen("pause");
  }

  function beginDemo() {
    setPack(demoPack);
    setUploadedName(null);
    setProcessingStep(3);
    setError(null);
    window.localStorage.setItem("questling-question-pack", JSON.stringify(demoPack));
    setScreen("processing");
  }

  function startBattle() {
    setBattle(initialBattleState());
    setSelectedIndex(null);
    setActiveCommand("Ability");
    setScreen("battle");
  }

  async function uploadPdf(file: File) {
    uploadController.current?.abort();
    const controller = new AbortController();
    uploadController.current = controller;
    setError(null);
    setUploadedName(file.name);
    setSources((items) => [file.name, ...items.filter((item) => item !== file.name)]);
    setProcessingStep(0);
    setScreen("processing");
    const timer = window.setInterval(() => setProcessingStep((step) => Math.min(2, step + 1)), 2200);

    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/generate-questions", { method: "POST", body, signal: controller.signal });
      const payload = (await response.json()) as { pack?: QuestionPack; error?: string };
      if (!response.ok || !payload.pack) throw new Error(payload.error ?? "The realm could not be created.");
      setPack(payload.pack);
      setProcessingStep(3);
      window.localStorage.setItem("questling-question-pack", JSON.stringify(payload.pack));
      setNotice(`${payload.pack.questions.length} grounded questions ready`);
    } catch (uploadError) {
      if (controller.signal.aborted) return;
      setError(uploadError instanceof Error ? uploadError.message : "The realm could not be created.");
      setScreen("world-builder");
    } finally {
      window.clearInterval(timer);
      if (uploadController.current === controller) uploadController.current = null;
    }
  }

  function continueAfterAnswer() {
    if (selectedIndex === null) return;
    const next = resolveAnswer(battle, currentQuestion, selectedIndex, pack.questions.length);
    setBattle(next);
    setSelectedIndex(null);
    if (next.status !== "playing") setScreen("results");
  }

  function toggleTeam(index: number) {
    // A full team rotates out the oldest slot so every click produces a clear result.
    setTeam((items) => items.includes(index)
      ? items.filter((item) => item !== index)
      : items.length < 3 ? [...items, index] : [...items.slice(1), index]);
  }

  useEffect(() => {
    // Restore only complete packs; malformed or partial cached data falls back to the demo.
    const cached = window.localStorage.getItem("questling-question-pack");
    if (!cached) return;
    try {
      const restored = JSON.parse(cached) as QuestionPack;
      if (restored.questions?.length >= 4) {
        const timer = window.setTimeout(() => setPack(restored), 0);
        return () => window.clearTimeout(timer);
      }
    } catch {
      window.localStorage.removeItem("questling-question-pack");
    }
  }, []);

  useEffect(() => {
    const cached = window.localStorage.getItem("questling-settings");
    if (!cached) return;
    try {
      const restored = JSON.parse(cached) as Partial<Settings>;
      const timer = window.setTimeout(() => setSettings((current) => ({ ...current, ...restored })), 0);
      return () => window.clearTimeout(timer);
    } catch {
      window.localStorage.removeItem("questling-settings");
    }
  }, []);

  useEffect(() => () => uploadController.current?.abort(), []);

  const value: QuestlingContextValue = {
    screen, previousGameScreen, pack, uploadedName, sources, processingStep, error, notice,
    avatarTab, avatarChoice, quest, tracked, clueSaved, sanctuaryMessage, bondLevel,
    codexTab, selectedCreature, team, masteryTopic, wardrobeTab, wardrobeChoice,
    inventoryTab, selectedItem, settingsTab, settings, accountTab, sourceReviewed,
    confirmAction, battle, selectedIndex, activeCommand, currentQuestion, selectedCorrect,
    answerReview, navigate, openPause, beginDemo, startBattle, uploadPdf,
    continueAfterAnswer, toggleTeam, setUploadedName, setSources, setProcessingStep,
    setNotice, setAvatarTab, setAvatarChoice, setQuest, setTracked, setClueSaved,
    setSanctuaryMessage, setBondLevel, setCodexTab, setSelectedCreature, setMasteryTopic,
    setWardrobeTab, setWardrobeChoice, setInventoryTab, setSelectedItem, setSettingsTab,
    setSettings, setAccountTab, setSourceReviewed, setConfirmAction, setSelectedIndex,
    setActiveCommand,
  };

  return <QuestlingContext.Provider value={value}>{children}</QuestlingContext.Provider>;
}

export function useQuestling() {
  const value = useContext(QuestlingContext);
  if (!value) throw new Error("useQuestling must be used inside QuestlingProvider");
  return value;
}

export { CREATURES };
