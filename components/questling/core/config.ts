export const SCREEN_IDS = [
  "avatar-create",
  "world-builder",
  "processing",
  "first-steps",
  "quest-journal",
  "discover",
  "battle",
  "results",
  "sanctuary",
  "codex",
  "bond",
  "team",
  "source-library",
  "source-details",
  "mastery",
  "review",
  "wardrobe",
  "inventory",
  "journey",
  "settings",
  "title",
  "pause",
  "source-attention",
  "account",
] as const;

export type Screen = (typeof SCREEN_IDS)[number];
export type Scene = "forest" | "archive" | "battle";

export const SCREEN_TITLES: Record<Screen, string> = {
  "avatar-create": "Create Your Avatar",
  "world-builder": "Build Your World",
  processing: "Realm Awakening",
  "first-steps": "First Steps",
  "quest-journal": "Quest Journal",
  discover: "Discover & Learn",
  battle: "Tactical Encounter",
  results: "Quest Complete",
  sanctuary: "Companion Sanctuary",
  codex: "Companion Codex",
  bond: "Bond Path",
  team: "Team Setup",
  "source-library": "Source Library",
  "source-details": "Source Details",
  mastery: "Mastery Atlas",
  review: "Answer Review",
  wardrobe: "Avatar & Wardrobe",
  inventory: "Inventory & Relics",
  journey: "Journey Progress",
  settings: "Settings & Accessibility",
  title: "Begin Your Journey",
  pause: "Pause & Navigation",
  "source-attention": "Source Needs Attention",
  account: "Account & Privacy",
};

export const PROCESSING_STEPS = [
  "Reading sources",
  "Mapping topics",
  "Creating quests",
  "Verifying citations",
];

export type Creature = {
  name: string;
  icon: string;
  type: "Forest" | "Water" | "Ruins";
  role: string;
  bond: number;
  artId?: QuestlingArtId;
};

export const CREATURES: readonly Creature[] = [
  { name: "Lumi", icon: "🦊", type: "Forest", role: "Tactician", bond: 4, artId: "starlight-fennec" },
  { name: "Mosskin", icon: "🌱", type: "Forest", role: "Warden", bond: 3, artId: "mossback-quill" },
  { name: "Rill", icon: "🦦", type: "Water", role: "Striker", bond: 3, artId: "glassfin-rook" },
  { name: "Auralis", icon: "🦌", type: "Ruins", role: "Oracle", bond: 2 },
  { name: "Thornwing", icon: "🐉", type: "Forest", role: "Striker", bond: 2 },
  { name: "Shellback", icon: "🐢", type: "Water", role: "Warden", bond: 1 },
  { name: "Glowcap", icon: "🍄", type: "Ruins", role: "Healer", bond: 1 },
  { name: "Nyx", icon: "🐈‍⬛", type: "Ruins", role: "Tactician", bond: 1 },
] as const;
import type { QuestlingArtId } from "../art/catalog";
