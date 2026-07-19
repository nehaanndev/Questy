import type { Scene } from "../core/config";
import { useQuestling } from "../core/QuestlingProvider";
import {
  AvatarCreateScreen,
  FirstStepsScreen,
  PauseScreen,
  ProcessingScreen,
  TitleScreen,
  WorldBuilderScreen,
} from "./HomeScreens";
import {
  BattleScreen,
  DiscoverScreen,
  JourneyScreen,
  MasteryScreen,
  QuestJournalScreen,
  ResultsScreen,
  ReviewScreen,
} from "./QuestScreens";
import { BondScreen, CodexScreen, SanctuaryScreen, TeamScreen } from "./CompanionScreens";
import {
  InventoryScreen,
  SourceAttentionScreen,
  SourceDetailsScreen,
  SourceLibraryScreen,
  WardrobeScreen,
} from "./LibraryScreens";
import { AccountScreen, SettingsScreen } from "./SystemScreens";

const FOREST_SCREENS = new Set(["title", "avatar-create", "first-steps", "quest-journal", "discover", "results", "sanctuary", "bond", "wardrobe", "journey", "pause"]);

export function sceneForScreen(screen: string): Scene {
  if (screen === "battle") return "battle";
  return FOREST_SCREENS.has(screen) ? "forest" : "archive";
}

export function ScreenRouter() {
  const { screen } = useQuestling();
  switch (screen) {
    case "title": return <TitleScreen />;
    case "avatar-create": return <AvatarCreateScreen />;
    case "world-builder": return <WorldBuilderScreen />;
    case "processing": return <ProcessingScreen />;
    case "first-steps": return <FirstStepsScreen />;
    case "quest-journal": return <QuestJournalScreen />;
    case "discover": return <DiscoverScreen />;
    case "battle": return <BattleScreen />;
    case "results": return <ResultsScreen />;
    case "sanctuary": return <SanctuaryScreen />;
    case "codex": return <CodexScreen />;
    case "bond": return <BondScreen />;
    case "team": return <TeamScreen />;
    case "source-library": return <SourceLibraryScreen />;
    case "source-details": return <SourceDetailsScreen />;
    case "mastery": return <MasteryScreen />;
    case "review": return <ReviewScreen />;
    case "wardrobe": return <WardrobeScreen />;
    case "inventory": return <InventoryScreen />;
    case "journey": return <JourneyScreen />;
    case "settings": return <SettingsScreen />;
    case "pause": return <PauseScreen />;
    case "source-attention": return <SourceAttentionScreen />;
    case "account": return <AccountScreen />;
  }
}
