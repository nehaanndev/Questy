"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { initialBattleState, resolveAnswer } from "@/lib/battle";
import { demoPack } from "@/lib/demo";
import type { BattleState, QuestionPack } from "@/lib/types";

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

type Screen = (typeof SCREEN_IDS)[number];
type Scene = "forest" | "archive" | "battle";
type TabKey = string;

const screenTitles: Record<Screen, string> = {
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

const processingSteps = ["Reading sources", "Mapping topics", "Creating quests", "Verifying citations"];
const creatures = [
  { name: "Lumi", icon: "🦊", type: "Forest", role: "Tactician", bond: 4 },
  { name: "Mosskin", icon: "🌱", type: "Forest", role: "Warden", bond: 3 },
  { name: "Rill", icon: "🦦", type: "Water", role: "Striker", bond: 3 },
  { name: "Auralis", icon: "🦌", type: "Ruins", role: "Oracle", bond: 2 },
  { name: "Thornwing", icon: "🐉", type: "Forest", role: "Striker", bond: 2 },
  { name: "Shellback", icon: "🐢", type: "Water", role: "Warden", bond: 1 },
  { name: "Glowcap", icon: "🍄", type: "Ruins", role: "Healer", bond: 1 },
  { name: "Nyx", icon: "🐈‍⬛", type: "Ruins", role: "Tactician", bond: 1 },
];

function Rune({ small = false }: { small?: boolean }) {
  return <span className={small ? "story-rune story-rune--small" : "story-rune"}>✦</span>;
}

function SceneFrame({
  screen,
  scene = "archive",
  children,
  onPause,
  onTitle,
  status,
}: {
  screen: Screen;
  scene?: Scene;
  children: React.ReactNode;
  onPause?: () => void;
  onTitle: () => void;
  status?: string;
}) {
  const number = SCREEN_IDS.indexOf(screen) + 1;
  return (
    <section className={`story-screen story-screen--${scene}`} data-testid={`screen-${screen}`}>
      <div className="story-screen__wash" />
      <header className="story-heading">
        <button className="story-brand" onClick={onTitle} aria-label="Go to title screen"><Rune small /> Questling</button>
        <h1><span>{number.toString().padStart(2, "0")}</span> {screenTitles[screen]}</h1>
        <div className="story-heading__tools">
          {status && <span className="story-status">● {status}</span>}
          {onPause && screen !== "pause" && <button className="icon-button" onClick={onPause} aria-label="Open pause menu">☰</button>}
        </div>
      </header>
      <div className="story-content">{children}</div>
    </section>
  );
}

function Tabs({ items, active, onChange, label }: { items: TabKey[]; active: TabKey; onChange: (tab: TabKey) => void; label: string }) {
  return (
    <div className="story-tabs" role="tablist" aria-label={label}>
      {items.map((item) => <button key={item} role="tab" aria-selected={active === item} className={active === item ? "active" : ""} onClick={() => onChange(item)}>{item}</button>)}
    </div>
  );
}

function ExplorerPair({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "explorer-pair explorer-pair--compact" : "explorer-pair"} aria-label="Your avatar and Lumi">
      <div className="illustrated-avatar"><span className="illustrated-avatar__head" /><span className="illustrated-avatar__body" /></div>
      <div className="illustrated-lumi"><i /><b>•ᴗ•</b></div>
    </div>
  );
}

function Meter({ value, tone = "mint" }: { value: number; tone?: "mint" | "gold" | "red" }) {
  return <span className={`story-meter story-meter--${tone}`}><i style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></span>;
}

export default function QuestlingApp() {
  const [screen, setScreen] = useState<Screen>("title");
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
  const [settings, setSettings] = useState({ motion: false, largeText: false, dyslexia: false, contrast: true, dialogue: 68, music: 45, controls: "Mouse" });
  const [accountTab, setAccountTab] = useState("Profile");
  const [sourceReviewed, setSourceReviewed] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [battle, setBattle] = useState<BattleState>(initialBattleState);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeCommand, setActiveCommand] = useState("Ability");
  const uploadController = useRef<AbortController | null>(null);

  const currentQuestion = pack.questions[battle.questionIndex] ?? pack.questions[0];
  const selectedCorrect = selectedIndex !== null && selectedIndex === currentQuestion.correctIndex;
  const answerReview = useMemo(() => battle.answers.flatMap((answer) => {
    const question = pack.questions.find((item) => item.id === answer.questionId);
    return question ? [{ answer, question }] : [];
  }), [battle.answers, pack.questions]);

  function navigate(target: Screen) {
    if (target === screen) return;
    setScreen(target);
  }

  function openPause() {
    setPreviousGameScreen(screen);
    navigate("pause");
  }

  function beginDemo() {
    setPack(demoPack);
    setUploadedName(null);
    setProcessingStep(3);
    setError(null);
    window.localStorage.setItem("questling-question-pack", JSON.stringify(demoPack));
    navigate("processing");
  }

  function startBattle() {
    setBattle(initialBattleState());
    setSelectedIndex(null);
    setActiveCommand("Ability");
    navigate("battle");
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
    if (next.status !== "playing") navigate("results");
  }

  function toggleTeam(index: number) {
    setTeam((items) => items.includes(index) ? items.filter((item) => item !== index) : items.length < 3 ? [...items, index] : [...items.slice(1), index]);
  }

  useEffect(() => {
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

  useEffect(() => () => uploadController.current?.abort(), []);

  const common = { onPause: openPause, onTitle: () => navigate("title"), status: notice };

  if (screen === "title") return (
    <main className="app-shell">
      <SceneFrame screen="title" scene="forest" onTitle={() => undefined}>
        <div className="title-layout">
          <div className="title-card">
            <Rune />
            <p className="eyebrow">A STUDY WORLD BUILT FROM YOUR NOTES</p>
            <h2>Questling</h2>
            <p>Explore, bond with companions, and master your own material through a living 2D adventure.</p>
            <button className="story-button story-button--primary" onClick={() => navigate("avatar-create")}>✦ Create Account</button>
            <button className="story-button" onClick={() => { setNotice("Signed in for this prototype"); navigate("source-library"); }}>↪ Sign In</button>
            <button className="story-button" onClick={() => { setNotice("Playing as guest"); navigate("first-steps"); }}>● Continue as Guest</button>
            <small>♢ Privacy for learners · uploads remain under your control</small>
          </div>
          <ExplorerPair />
        </div>
      </SceneFrame>
    </main>
  );

  let content: React.ReactNode = null;
  let scene: Scene = "archive";

  if (screen === "avatar-create") {
    scene = "forest";
    const options = avatarTab === "Face" ? ["Warm", "Deep", "Fair", "Olive"] : avatarTab === "Hair" ? ["Tousled", "Braided", "Cropped", "Wavy"] : avatarTab === "Outfit" ? ["Archive", "Verdant", "Scholar", "Night"] : ["Calm", "Bright", "Soft", "Bold"];
    content = <div className="split-layout"><ExplorerPair /><div className="story-panel avatar-panel"><Tabs items={["Face", "Hair", "Outfit", "Voice"]} active={avatarTab} onChange={setAvatarTab} label="Avatar options" /><div className="choice-grid">{options.map((option, index) => <button key={option} className={avatarChoice === index ? "choice-card active" : "choice-card"} onClick={() => setAvatarChoice(index)}><span>{avatarTab === "Face" ? "◉" : avatarTab === "Hair" ? "♟" : avatarTab === "Outfit" ? "♙" : "♫"}</span><b>{option}</b></button>)}</div><p className="selection-note">Selected {avatarTab.toLowerCase()}: <strong>{options[avatarChoice] ?? options[0]}</strong></p><button className="story-button story-button--primary" onClick={() => navigate("world-builder")}>✦ Continue ✦</button></div></div>;
  }

  if (screen === "world-builder") {
    content = <div className="center-card world-builder-card"><h2>Turn notes into a realm</h2><p>Upload a PDF for AI-grounded questions, or use the included environmental-science scenario.</p>{error && <div className="error-banner" role="alert">{error}</div>}<label className="story-upload"><input aria-label="Upload notes PDF" type="file" accept="application/pdf,.pdf" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadPdf(file); event.currentTarget.value = ""; }} /><span>⇧</span><b>Upload Notes</b><small>PDF · up to 15 MB</small></label><div className="source-stack">{sources.map((source) => <button key={source} onClick={() => setNotice(`${source} selected as active source`)}><span>{source.endsWith("docx") ? "DOCX" : "PDF"}</span>{source}<b>✓</b></button>)}</div><div className="button-row"><button className="story-button" onClick={() => navigate("source-library")}>View Library</button><button className="story-button story-button--primary" onClick={beginDemo}>Build Demo Realm</button></div><small>♙ Only you can access your materials</small></div>;
  }

  if (screen === "processing") {
    content = <div className="processing-layout"><div className="story-panel processing-card"><span className="leaf-seal">♧</span><h2>Building the {pack.topics[0]} Realm</h2>{processingSteps.map((step, index) => <div className={`processing-row ${index <= processingStep ? "done" : ""}`} key={step}><span>{index <= processingStep ? "✓" : "○"}</span>{step}</div>)}<Meter value={(processingStep + 1) * 25} /><strong>{(processingStep + 1) * 25}%</strong>{processingStep === 3 && <button className="story-button story-button--primary" onClick={() => navigate("first-steps")}>Enter the Realm</button>}</div><div className="realm-awakening-art"><span>✦</span><p>Every verified topic becomes a path, quest, or encounter.</p></div></div>;
  }

  if (screen === "first-steps") {
    scene = "forest";
    content = <div className="exploration-layout"><ExplorerPair /><div className="quest-objective"><p className="eyebrow">ACTIVE QUEST</p><h2>Walk to the Archive Gate</h2><p>Choose a glowing location. Your avatar and Lumi move together through the scene.</p></div><div className="hotspot-cluster"><button className="world-hotspot world-hotspot--archive" onClick={() => navigate("discover")}><span>✦</span><b>Archive Gate</b><small>Discover a source fragment</small></button><button className="world-hotspot world-hotspot--journal" onClick={() => navigate("quest-journal")}><span>▤</span><b>Quest Journal</b><small>Track objectives</small></button><button className="world-hotspot world-hotspot--sanctuary" onClick={() => navigate("sanctuary")}><span>♧</span><b>Sanctuary</b><small>Visit companions</small></button></div><div className="click-guide">Click a glowing destination to move there</div></div>;
  }

  if (screen === "quest-journal") {
    scene = "forest";
    const quests = ["The Forgotten Archive", "Echoes of the Cell", "Weak Topic: Mitochondria"];
    content = <div className="journal-layout"><div className="story-panel quest-list"><h2>Quests</h2>{quests.map((item, index) => <button className={quest === item ? "active" : ""} key={item} onClick={() => setQuest(item)}><span>{index === 0 ? "✦" : index === 1 ? "♧" : "△"}</span><b>{item}</b><small>{index === 0 ? "In progress" : index === 1 ? "Available" : "Recommended"}</small></button>)}</div><div className="map-panel"><div className="map-path">{["Canal Village", "Forest", "Ruined Archive", "Mountain Lake"].map((place) => <button key={place} onClick={() => setNotice(`${place} selected on the quest map`)}>{place}<span>✦</span></button>)}</div><div className="story-panel quest-detail-card"><p className="eyebrow">{quest}</p><h2>{quest}</h2><p>{quest === "The Forgotten Archive" ? "Follow the light to the old library and uncover what was lost." : "A focused study route generated from your active notes."}</p><ul><li>✓ Reach the Archive Gate</li><li>○ Explore the Archive</li><li>○ Answer the Archive Trial</li></ul><div className="button-row"><button className="story-button" onClick={() => { setTracked((value) => !value); setNotice(tracked ? "Quest untracked" : "Quest tracked"); }}>{tracked ? "Untrack Quest" : "Track Quest"}</button><button className="story-button story-button--primary" onClick={startBattle}>Start Encounter</button></div></div></div></div>;
  }

  if (screen === "discover") {
    scene = "forest";
    content = <div className="discover-layout"><ExplorerPair compact /><div className="story-panel dialogue-card"><div className="npc-line"><span>◎</span><div><b>Archivist Liora</b><p>The ancients recorded knowledge in living murals. Observe closely.</p></div></div><p className="eyebrow">♧ SOURCE FRAGMENT</p><h2>{currentQuestion.evidence.quote}</h2><small>{pack.sourceName} · {currentQuestion.evidence.pageLabel}</small><div className="button-row"><button className={clueSaved ? "story-button active" : "story-button"} onClick={() => { setClueSaved((value) => !value); setNotice(clueSaved ? "Clue removed" : "Clue saved to journal"); }}>{clueSaved ? "✓ Clue Saved" : "▤ Save Clue"}</button><button className="story-button story-button--primary" onClick={() => navigate("quest-journal")}>✦ Continue</button></div></div></div>;
  }

  if (screen === "battle") {
    scene = "battle";
    content = <div className="battle-layout"><div className="battle-status battle-status--player"><b>Lumi</b><span>{battle.playerHp} / 100</span><Meter value={battle.playerHp} /><small>TACTICIAN · {"◆".repeat(battle.actionSegments)}{"◇".repeat(3 - battle.actionSegments)}</small></div><div className="battle-status battle-status--enemy"><b>Verdant Guardian <small>Lv. 8</small></b><span>{battle.enemyHp} / 100</span><Meter value={battle.enemyHp} /><label>BREAK <Meter value={battle.breakMeter} tone="gold" /></label></div><ExplorerPair compact /><div className="guardian-art"><span>♜</span><b>VERDANT GUARDIAN</b></div><div className="battle-commands" aria-label="Battle commands">{["Strike", "Ward", "Ability", "Item"].map((command) => <button key={command} className={activeCommand === command ? "active" : ""} onClick={() => { setActiveCommand(command); setNotice(command === "Ability" ? "Answer to power the ability" : `${command} command selected`); }}>{command}</button>)}</div><div className="story-panel question-card"><p className="eyebrow">{activeCommand === "Ability" ? "✦ POWER THE ABILITY" : `${activeCommand.toUpperCase()} COMMAND`}</p>{activeCommand === "Ability" ? <><div className="question-title"><h2>{currentQuestion.prompt}</h2><span>Question {battle.questionIndex + 1} of {pack.questions.length}</span></div><div className="battle-answers">{currentQuestion.choices.map((choice, index) => <button key={choice} disabled={selectedIndex !== null} className={selectedIndex === index ? (selectedCorrect ? "correct" : "incorrect") : ""} onClick={() => setSelectedIndex(index)}><span>{String.fromCharCode(65 + index)}</span>{choice}</button>)}</div>{selectedIndex === null ? <div className="question-meta"><button onClick={() => navigate("source-details")}>▤ {pack.sourceName} · {currentQuestion.evidence.pageLabel}</button><span>Correct answers fill action segments</span></div> : <div className={selectedCorrect ? "battle-feedback correct" : "battle-feedback incorrect"} role="status"><p><b>{selectedCorrect ? "Focus aligned" : "The guardian interrupts"}</b> — {currentQuestion.explanation}</p><button className="story-button" onClick={() => navigate("source-details")}>View Source</button><button className="story-button story-button--primary" onClick={continueAfterAnswer}>Continue</button></div>}</> : <div className="command-effect"><h2>{activeCommand} is ready.</h2><p>{activeCommand === "Strike" ? "Deal light damage without spending a study charge." : activeCommand === "Ward" ? "Reduce damage from the next incorrect answer." : "Use a collected relic from your inventory."}</p><button className="story-button story-button--primary" onClick={() => { setNotice(`${activeCommand} prepared`); setActiveCommand("Ability"); }}>Prepare {activeCommand}</button></div>}</div></div>;
  }

  if (screen === "results") {
    scene = "forest";
    const score = battle.answers.length ? battle.correctCount : 7;
    const total = battle.answers.length ? battle.answers.length : 8;
    content = <div className="results-layout"><ExplorerPair /><div className="story-panel results-summary"><Rune /><h2>Quest Complete</h2><div className="score-line">✓ <strong>{score} / {total} correct</strong></div><div className="reward-grid"><span>✦ Mastery +{score + 5}</span><span>♥ Bond +{Math.max(4, score)}</span></div><button className="reward-item" onClick={() => { setSelectedItem("Archive Key"); navigate("inventory"); }}><span>⚿</span><b>Archive Key</b><small>Added to your inventory</small></button><p>△ Review: Cell respiration</p><div className="button-row"><button className="story-button" onClick={() => navigate("review")}>▤ Review Answers</button><button className="story-button story-button--primary" onClick={() => navigate("journey")}>✦ Continue Journey</button></div></div></div>;
  }

  if (screen === "sanctuary") {
    scene = "forest";
    content = <div className="sanctuary-layout"><ExplorerPair /><div className="sanctuary-creatures">{creatures.slice(1, 4).map((creature, index) => <button key={creature.name} onClick={() => { setSelectedCreature(index + 1); navigate("codex"); }}><span>{creature.icon}</span><b>{creature.name}</b></button>)}</div><div className="story-panel sanctuary-actions"><p>{sanctuaryMessage}</p>{["Call", "Feed", "Train"].map((action) => <button className="story-button" key={action} onClick={() => { setSanctuaryMessage(action === "Call" ? `${creatures[selectedCreature].name} trots over.` : action === "Feed" ? "Bond increased with a favorite treat." : "Training complete: Focus +1."); if (action === "Feed") setBondLevel((level) => Math.min(5, level + 1)); }}>{action}</button>)}<button className="story-button" onClick={() => navigate("team")}>Team Setup</button><button className="story-button story-button--primary" onClick={() => navigate("codex")}>Open Codex · 8 / 48</button></div></div>;
  }

  if (screen === "codex") {
    const filtered = codexTab === "All" ? creatures : creatures.filter((creature) => creature.type === codexTab);
    const chosen = creatures[selectedCreature];
    content = <div className="codex-layout"><div className="story-panel codex-grid"><p>{creatures.length} / 48 discovered</p><Tabs items={["All", "Forest", "Water", "Ruins"]} active={codexTab} onChange={setCodexTab} label="Companion habitats" /><div className="creature-grid">{filtered.map((creature) => { const index = creatures.indexOf(creature); return <button key={creature.name} className={selectedCreature === index ? "active" : ""} onClick={() => setSelectedCreature(index)}><span>{creature.icon}</span><b>{creature.name}</b></button>; })}</div></div><div className="story-panel creature-detail"><h2>{chosen.name}</h2><span className="creature-hero">{chosen.icon}</span><h3>✦ {chosen.role}</h3><p>Bond Lv. {chosen.bond}</p><div>{"◆".repeat(chosen.bond)}{"◇".repeat(5 - chosen.bond)}</div><div className="button-row"><button className="story-button" onClick={() => navigate("bond")}>Bond Path</button><button className="story-button story-button--primary" onClick={() => toggleTeam(selectedCreature)}>{team.includes(selectedCreature) ? "Remove from Team" : "Add to Team"}</button></div></div></div>;
  }

  if (screen === "bond") {
    scene = "forest";
    const chosen = creatures[selectedCreature];
    content = <div className="bond-layout"><ExplorerPair /><div className="story-panel bond-card"><div className="bond-title"><span>{chosen.icon}</span><div><h2>{chosen.name}</h2><p>Bond Lv. {bondLevel}</p><div>{"◆".repeat(bondLevel)}{"◇".repeat(5 - bondLevel)}</div></div></div><div className="bond-path"><div><span>◉</span><b>Curious</b></div>{["Shared Focus", "Archive Sense", "Chain Assist"].map((skill) => <button key={skill} onClick={() => setNotice(`${skill} selected on ${chosen.name}'s bond path`)}>✦ {skill}</button>)}</div><button className="story-button story-button--primary" onClick={() => { setBondLevel((level) => Math.min(5, level + 1)); setNotice(`You spent time with ${chosen.name}`); }}>♥ Spend Time</button></div></div>;
  }

  if (screen === "team") {
    content = <div className="team-layout"><div className="team-title"><span /> Active Team ({team.length} / 3) <span /></div><div className="active-team">{creatures.slice(0, 4).map((creature, index) => <button key={creature.name} className={team.includes(index) ? "active" : ""} onClick={() => toggleTeam(index)}><span>{creature.icon}</span><b>{creature.name}</b><small>{creature.role}</small><i>{team.includes(index) ? "✓ Active" : "Add"}</i></button>)}</div><div className="story-panel bench"><p>Bench · click to swap</p>{creatures.slice(4).map((creature, index) => <button key={creature.name} onClick={() => toggleTeam(index + 4)}><span>{creature.icon}</span>{creature.name}</button>)}</div><button className="story-button story-button--primary" onClick={() => setNotice(`Team saved with ${team.length} companions`)}>♢ Save Team</button></div>;
  }

  if (screen === "source-library") {
    content = <div className="library-layout"><div className="library-intro"><p>♧ Your trusted sources for grounded learning.</p><label className="story-button story-button--primary compact-upload">⇧ Add Material<input aria-label="Add source PDF" type="file" accept="application/pdf,.pdf" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadPdf(file); event.currentTarget.value = ""; }} /></label></div><div className="story-panel source-table"><div className="source-row source-row--head"><span>Source</span><span>Status</span><span>Pages</span><span>Last studied</span><span /></div>{sources.map((source, index) => <button className="source-row" key={source} onClick={() => { setUploadedName(source); navigate("source-details"); }}><span><b className="file-icon">{source.endsWith("docx") ? "DOCX" : "PDF"}</b>{source}</span><span><i>✓ Ready</i></span><span>{24 - index * 4}</span><span>{index === 0 ? "Today, 8:42 PM" : `${index + 1} days ago`}</span><span>›</span></button>)}</div><button className="story-button" onClick={() => navigate("source-attention")}>▤ Manage Uploads</button><button className="story-button story-button--primary" onClick={() => navigate("first-steps")}>Enter Active Realm</button></div>;
  }

  if (screen === "source-details") {
    content = <div className="story-panel source-detail-layout"><div className="source-preview"><Image src="/assets/demo-notes-1.jpg" alt="Preview of source notes" width={573} height={1280} /></div><div className="source-info"><h2>{uploadedName ?? pack.sourceName}</h2><p>24 pages · Uploaded today</p><div className="source-analysis"><div><h3>Topic Outline</h3>{pack.topics.map((topic) => <button key={topic} onClick={() => { setMasteryTopic(topic); navigate("mastery"); }}>♧ {topic}</button>)}</div><div><h3>Processing Confidence</h3><span className="confidence-seal">♧</span><b>High</b></div></div><div className="grounding-preview"><h3>Grounding Preview</h3><p>✓ All questions will be grounded in this source. Cited excerpts come directly from these pages.</p></div><div className="button-row wrap"><button className="story-button" onClick={() => { setPack(demoPack); setNotice("Source activated for new questions"); }}>✦ Use for Questions</button><button className="story-button" onClick={() => { setProcessingStep(3); setNotice("Source reprocessed successfully"); }}>⚙ Reprocess</button><button className="story-button story-button--danger" onClick={() => setConfirmAction("delete-source")}>♲ Delete</button><button className="story-button story-button--primary" onClick={() => navigate("first-steps")}>✦ Enter Realm</button></div></div></div>;
  }

  if (screen === "mastery") {
    const topics = [{ name: "Cell structure", value: 82 }, { name: "Mitochondria", value: 61 }, { name: "ATP", value: 54 }, { name: "Genetics", value: 76 }];
    content = <div className="mastery-layout"><div className="mastery-web">{topics.map((topic, index) => <button key={topic.name} className={`mastery-node mastery-node--${index}`} onClick={() => setMasteryTopic(topic.name)}><span>{index === 0 ? "◉" : index === 1 ? "◎" : index === 2 ? "ϟ" : "⌘"}</span><b>{topic.name}</b><small>{topic.value}%</small></button>)}</div><div className="story-panel mastery-detail"><p className="eyebrow">♧ RECOMMENDED REVIEW</p><h2>{masteryTopic}</h2><p>Your mastery is lower in this area. Review to strengthen your knowledge.</p><ul><li>4 key concepts</li><li>6 related questions</li></ul><button className="story-button story-button--primary" onClick={startBattle}>✦ Start Review Quest</button></div></div>;
  }

  if (screen === "review") {
    const review = answerReview[0];
    const question = review?.question ?? currentQuestion;
    const answer = review?.answer;
    content = <div className="review-layout"><div className="story-panel review-card"><p className="eyebrow">Question 1 of {Math.max(1, answerReview.length)}</p><h2>{question.prompt}</h2><p className="wrong-line">⊗ Your answer: {answer ? question.choices[answer.selectedIndex] : "Nucleus"}</p><p className="right-line">✓ Correct answer: {question.choices[question.correctIndex]}</p><div className="explanation-box"><h3>Explanation</h3><p>{question.explanation}</p></div><div className="source-excerpt"><h3>Source Excerpt</h3><small>{pack.sourceName} · {question.evidence.pageLabel}</small><blockquote>“{question.evidence.quote}”</blockquote></div><div className="button-row"><button className="story-button" onClick={() => navigate("source-details")}>▤ Open Page</button><button className="story-button" onClick={() => setNotice("Question flagged for review")}>△ Report Question</button><button className="story-button story-button--primary" onClick={() => navigate("results")}>✓ Got It</button></div></div><div className="review-page"><Image src="/assets/demo-notes-1.jpg" alt="Cited source page" width={573} height={1280} /></div></div>;
  }

  if (screen === "wardrobe") {
    scene = "forest";
    const wardrobeOptions = ["Archive blue", "Verdant green", "Scholar ivory", "Night violet"];
    content = <div className="split-layout"><ExplorerPair /><div className="story-panel wardrobe-panel"><Tabs items={["Outfits", "Hair", "Accessories", "Colors"]} active={wardrobeTab} onChange={setWardrobeTab} label="Wardrobe categories" /><div className="wardrobe-grid">{wardrobeOptions.map((option, index) => <button className={wardrobeChoice === index ? "active" : ""} key={option} onClick={() => setWardrobeChoice(index)}><span>♙</span><b>{option}</b><i>{index === 3 ? "Locked" : "Available"}</i></button>)}</div><p>Previewing: <strong>{wardrobeOptions[wardrobeChoice]}</strong></p><div className="button-row"><button className="story-button" onClick={() => setNotice(`${wardrobeOptions[wardrobeChoice]} equipped`)}>♧ Equip</button><button className="story-button story-button--primary" onClick={() => setNotice("Avatar look saved")}>✦ Save Look</button></div></div></div>;
  }

  if (screen === "inventory") {
    const items = inventoryTab === "Relics" ? ["Archive Key", "Moon Compass", "Verdant Leaf", "Ancient Tablet"] : inventoryTab === "Quest" ? ["Sealed Letter", "Archive Map", "Warden Sigil"] : inventoryTab === "Gifts" ? ["Lumi Plush", "Moon Treat", "Silver Bell"] : ["Focus Crystal", "Spring Water", "Moss Thread"];
    content = <div className="inventory-layout"><div className="story-panel inventory-grid"><Tabs items={["Quest", "Relics", "Gifts", "Materials"]} active={inventoryTab} onChange={(tab) => { setInventoryTab(tab); setSelectedItem(tab === "Relics" ? "Archive Key" : tab === "Quest" ? "Sealed Letter" : tab === "Gifts" ? "Lumi Plush" : "Focus Crystal"); }} label="Inventory categories" /><div className="item-grid">{items.map((item, index) => <button className={selectedItem === item ? "active" : ""} key={item} onClick={() => setSelectedItem(item)}><span>{index === 0 ? "⚿" : index === 1 ? "◉" : index === 2 ? "♧" : "▤"}</span><b>{item}</b></button>)}</div></div><div className="story-panel item-detail"><span className="item-hero">{selectedItem.includes("Key") ? "⚿" : selectedItem.includes("Lumi") ? "🦊" : "✦"}</span><h2>{selectedItem}</h2><p>{selectedItem === "Archive Key" ? "Opens sealed doors in the Forgotten Archive." : "A useful reward collected during your study journey."}</p><button className="story-button story-button--primary" onClick={() => setNotice(`${selectedItem} used successfully`)}>✦ Use</button></div></div>;
  }

  if (screen === "journey") {
    scene = "forest";
    const goals = [["Complete one review quest", 100, "1 / 1"], ["Answer 10 questions", 70, "7 / 10"], ["Spend time with a companion", 75, "15 / 20 min"]] as const;
    content = <div className="journey-layout"><ExplorerPair /><div className="story-panel journey-card"><h2>7 day journey</h2><div className="day-path">{[1,2,3,4,5,6,7].map((day) => <button key={day} onClick={() => setNotice(`Day ${day} selected`)} className={day <= 4 ? "done" : ""}>{day <= 3 ? "✓" : day === 4 ? "✦" : "○"}</button>)}</div>{goals.map(([label, value, count]) => <button className="goal-row" key={label} onClick={() => label.includes("companion") ? navigate("bond") : navigate("quest-journal")}><span>{label}</span><Meter value={value} /><b>{count}</b></button>)}<div className="achievement-row"><span>♧</span><div><h3>Archive Seeker</h3><p>Answer 50 questions from the Source Library.</p><Meter value={74} /></div><b>37 / 50</b></div><button className="story-button story-button--primary" onClick={() => navigate("quest-journal")}>▤ View Journal</button></div></div>;
  }

  if (screen === "settings") {
    content = <div className="settings-layout"><div className="story-panel settings-card"><Tabs items={["Accessibility", "Controls", "Audio", "Privacy"]} active={settingsTab} onChange={setSettingsTab} label="Settings categories" />{settingsTab === "Accessibility" && <div className="setting-list">{[["Reduce motion", "motion"], ["Larger text", "largeText"], ["Dyslexia-friendly font", "dyslexia"], ["High contrast questions", "contrast"]].map(([label, key]) => <label key={key}><span>{label}</span><input type="checkbox" checked={Boolean(settings[key as keyof typeof settings])} onChange={(event) => setSettings((value) => ({ ...value, [key]: event.target.checked }))} /><i /></label>)}</div>}{settingsTab === "Controls" && <div className="control-options">{["Mouse", "Keyboard", "Touch"].map((control) => <button className={settings.controls === control ? "active" : ""} key={control} onClick={() => setSettings((value) => ({ ...value, controls: control }))}>{control}</button>)}</div>}{settingsTab === "Audio" && <div className="slider-list"><label>Dialogue volume <input aria-label="Dialogue volume" type="range" min="0" max="100" value={settings.dialogue} onChange={(event) => setSettings((value) => ({ ...value, dialogue: Number(event.target.value) }))} /></label><label>Music volume <input aria-label="Music volume" type="range" min="0" max="100" value={settings.music} onChange={(event) => setSettings((value) => ({ ...value, music: Number(event.target.value) }))} /></label></div>}{settingsTab === "Privacy" && <div className="privacy-copy"><h2>Your sources stay yours.</h2><p>Uploaded materials are used to build grounded questions. Delete controls are always available in Account & Privacy.</p><button className="story-button" onClick={() => navigate("account")}>Open Account & Privacy</button></div>}<button className="story-button story-button--primary" onClick={() => { window.localStorage.setItem("questling-settings", JSON.stringify(settings)); setNotice("Settings saved"); }}>✦ Save Settings</button></div></div>;
  }

  if (screen === "pause") {
    scene = "forest";
    content = <div className="pause-layout"><ExplorerPair compact /><div className="story-panel pause-menu">{[["▶", "Resume", previousGameScreen], ["▤", "Quest Journal", "quest-journal"], ["▰", "Source Library", "source-library"], ["♧", "Companions", "sanctuary"], ["⚙", "Settings", "settings"], ["⌂", "Return to Title", "title"]].map(([icon, label, target]) => <button key={label} className={label === "Resume" ? "story-button story-button--primary" : "story-button"} onClick={() => navigate(target as Screen)}>{icon} {label}</button>)}<small>✓ Saved just now</small></div></div>;
  }

  if (screen === "source-attention") {
    content = <div className="story-panel attention-card"><div className="attention-heading"><span>△</span><div><h2>Scanned Biology Notes.pdf</h2><h3>{sourceReviewed ? "All pages reviewed" : "6 pages need review"}</h3><p>Some content is unclear or low confidence. Review it before questions are generated.</p></div></div><div className="page-thumbnails">{[7,8,9,10,11,12].map((page) => <button key={page} className={sourceReviewed ? "reviewed" : ""} onClick={() => setNotice(`Page ${page} opened for review`)}><Image src={page % 2 ? "/assets/demo-notes-1.jpg" : "/assets/demo-notes-2.jpg"} alt={`Notes page ${page}`} width={573} height={1280} /><span>{sourceReviewed ? "✓" : page}</span></button>)}</div><div className="button-row"><button className="story-button" onClick={() => { setSourceReviewed(true); setNotice("Low-confidence pages marked reviewed"); }}>◉ Review Pages</button><button className="story-button" onClick={() => setNotice("OCR retry complete: confidence improved")}>↻ Retry OCR</button><button className="story-button story-button--danger" onClick={() => setConfirmAction("remove-source")}>♲ Remove Source</button></div><small>♢ No questions will be created from unreadable pages.</small></div>;
  }

  if (screen === "account") {
    const actions = accountTab === "Profile" ? [["Export Learning Data", "Download your questions, answers, and progress."], ["Edit Profile", "Update your display name and avatar."]] : accountTab === "Data" ? [["Export Learning Data", "Download your learning history."], ["Clear Local Progress", "Reset this browser's prototype progress."]] : accountTab === "Uploads" ? [["Manage Uploaded Materials", `${sources.length} sources · 58 pages`], ["Delete Uploaded Materials", "Remove all uploaded sources and related data."]] : [["Parental Controls", "Safety and content preferences."], ["Learning Summary", "View a learner-safe progress overview."]];
    content = <div className="account-layout"><div className="story-panel account-tabs">{["Profile", "Data", "Uploads", "Parental Controls"].map((tab) => <button className={accountTab === tab ? "active" : ""} key={tab} onClick={() => setAccountTab(tab)}><span>{tab === "Profile" ? "◎" : tab === "Data" ? "▣" : tab === "Uploads" ? "⇧" : "♟"}</span><b>{tab}</b></button>)}</div><div className="story-panel account-card"><div className="profile-line"><span>◎</span><div><h2>Lumi</h2><p>lumi@questling.app</p><small>Member since May 12, 2025</small></div></div>{actions.map(([title, body], index) => <button className="account-action" key={title} onClick={() => { if (title.includes("Delete") || title.includes("Clear")) setConfirmAction(title); else if (title.includes("Manage")) navigate("source-library"); else if (title.includes("Edit Profile")) navigate("wardrobe"); else setNotice(`${title} complete`); }}><b>{title}</b><span>{body}</span><i>{index === 0 ? "›" : ""}</i></button>)}<button className="account-action danger" onClick={() => setConfirmAction("delete-account")}><b>Delete Account</b><span>Permanently delete your account and all data.</span></button></div></div>;
  }

  return (
    <main className={settings.largeText ? "app-shell large-text" : settings.dyslexia ? "app-shell dyslexia-text" : "app-shell"}>
      <SceneFrame screen={screen} scene={scene} {...common}>{content}</SceneFrame>
      {confirmAction && <div className="modal-backdrop" role="presentation"><div className="story-panel confirm-modal" role="dialog" aria-modal="true" aria-label="Confirm action"><Rune /><h2>Confirm this action?</h2><p>{confirmAction.replaceAll("-", " ")} affects this local prototype. You can cancel safely.</p><div className="button-row"><button className="story-button" onClick={() => setConfirmAction(null)}>Cancel</button><button className="story-button story-button--danger" onClick={() => { if (confirmAction === "delete-source" || confirmAction === "remove-source") setSources((items) => items.slice(1)); if (confirmAction === "delete-account") { window.localStorage.clear(); setScreen("title"); } setNotice(`${confirmAction.replaceAll("-", " ")} completed`); setConfirmAction(null); }}>Confirm</button></div></div></div>}
    </main>
  );
}
