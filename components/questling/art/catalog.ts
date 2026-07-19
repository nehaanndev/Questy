/**
 * Central catalogue for generated Questling character art.
 * Screens should store the stable `id`, then read presentation details here.
 */
export type ArtKind = "avatar" | "companion" | "enemy";

export type QuestlingArtEntry = {
  id: string;
  kind: ArtKind;
  name: string;
  role: string;
  src: string;
  alt: string;
  accent: "teal" | "emerald" | "violet" | "gold";
};

export const AVATAR_ART = [
  {
    id: "pathfinder",
    kind: "avatar",
    name: "Pathfinder",
    role: "Curious Explorer",
    src: "/assets/characters/pathfinder-avatar.png",
    alt: "A young pathfinder in midnight-blue and emerald travel clothes",
    accent: "teal",
  },
  {
    id: "archive-mage",
    kind: "avatar",
    name: "Archive Mage",
    role: "Insight Weaver",
    src: "/assets/characters/archive-mage-avatar.png",
    alt: "An archive mage holding a rune-bound notebook and teal magic",
    accent: "emerald",
  },
  {
    id: "guardian",
    kind: "avatar",
    name: "Guardian",
    role: "Steadfast Protector",
    src: "/assets/characters/guardian-avatar.png",
    alt: "A guardian wearing emerald layers and carrying a round buckler",
    accent: "gold",
  },
] as const satisfies readonly QuestlingArtEntry[];

export const CREATURE_ART = [
  {
    id: "starlight-fennec",
    kind: "companion",
    name: "Lumi",
    role: "Starlight Tactician",
    src: "/assets/creatures/starlight-fennec.png",
    alt: "A starlight fennec companion with large ears and a teal-violet tail",
    accent: "violet",
  },
  {
    id: "mossback-quill",
    kind: "companion",
    name: "Mosskin",
    role: "Patient Warden",
    src: "/assets/creatures/mossback-quill.png",
    alt: "A round mossback quill companion covered in bark plates and ferns",
    accent: "emerald",
  },
  {
    id: "glassfin-rook",
    kind: "companion",
    name: "Rill",
    role: "River Striker",
    src: "/assets/creatures/glassfin-rook.png",
    alt: "A sleek glassfin rook companion with translucent blue fins",
    accent: "teal",
  },
  {
    id: "verdant-warden",
    kind: "enemy",
    name: "Verdant Warden",
    role: "Archive Guardian",
    src: "/assets/creatures/verdant-archive-warden.png",
    alt: "A towering elk-like archive warden made from stone, bark, and vines",
    accent: "emerald",
  },
  {
    id: "inkveil-marauder",
    kind: "enemy",
    name: "Inkveil Marauder",
    role: "Cunning Disruptor",
    src: "/assets/creatures/inkveil-marauder.png",
    alt: "A dark feathered jackal-like marauder surrounded by magical ink",
    accent: "violet",
  },
] as const satisfies readonly QuestlingArtEntry[];

export const QUESTLING_ART = [...AVATAR_ART, ...CREATURE_ART] as const;

export type QuestlingArtId = (typeof QUESTLING_ART)[number]["id"];

export function getQuestlingArt(id: QuestlingArtId): QuestlingArtEntry {
  const entry = QUESTLING_ART.find((candidate) => candidate.id === id);
  if (!entry) throw new Error(`Unknown Questling art id: ${id}`);
  return entry;
}
