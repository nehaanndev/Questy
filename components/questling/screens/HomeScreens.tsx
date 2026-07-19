import { PROCESSING_STEPS } from "../core/config";
import { useQuestling } from "../core/QuestlingProvider";
import { ExplorerPair, Meter, Rune, Tabs } from "../core/primitives";
import { AVATAR_ART, QuestlingArt, QuestlingArtCard } from "../art/QuestlingArt";

export function TitleScreen() {
  const { navigate, setNotice } = useQuestling();
  return (
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
  );
}

export function AvatarCreateScreen() {
  const { avatarTab, setAvatarTab, avatarChoice, setAvatarChoice, navigate } = useQuestling();
  const options = avatarTab === "Face"
    ? ["Warm", "Deep", "Fair", "Olive"]
    : avatarTab === "Hair"
      ? ["Tousled", "Braided", "Cropped", "Wavy"]
      : avatarTab === "Outfit"
        ? ["Archive", "Verdant", "Scholar", "Night"]
        : ["Calm", "Bright", "Soft", "Bold"];
  const icon = avatarTab === "Face" ? "◉" : avatarTab === "Hair" ? "♟" : avatarTab === "Outfit" ? "♙" : "♫";
  const selectedAvatar = AVATAR_ART[avatarChoice % AVATAR_ART.length];

  return (
    <div className="split-layout">
      <div className="avatar-showcase">
        <QuestlingArt id={selectedAvatar.id} crop="full" priority sizes="(max-width: 900px) 90vw, 520px" />
        <div><p className="eyebrow">SELECTED PATH</p><h2>{selectedAvatar.name}</h2><span>{selectedAvatar.role}</span></div>
      </div>
      <div className="story-panel avatar-panel">
        <Tabs items={["Face", "Hair", "Outfit", "Voice"]} active={avatarTab} onChange={(tab) => { setAvatarTab(tab); setAvatarChoice(0); }} label="Avatar options" />
        {avatarTab === "Outfit" ? (
          <div className="avatar-art-grid">
            {AVATAR_ART.map((avatar, index) => <QuestlingArtCard key={avatar.id} id={avatar.id} crop="portrait" selected={avatarChoice === index} onClick={() => setAvatarChoice(index)} />)}
          </div>
        ) : (
          <div className="choice-grid">
            {options.map((option, index) => (
              <button key={option} className={avatarChoice === index ? "choice-card active" : "choice-card"} onClick={() => setAvatarChoice(index)}>
                <span>{icon}</span><b>{option}</b>
              </button>
            ))}
          </div>
        )}
        <p className="selection-note">Selected {avatarTab.toLowerCase()}: <strong>{options[avatarChoice] ?? options[0]}</strong></p>
        <button className="story-button story-button--primary" onClick={() => navigate("world-builder")}>✦ Continue ✦</button>
      </div>
    </div>
  );
}

export function WorldBuilderScreen() {
  const { error, sources, setNotice, uploadPdf, navigate, beginDemo } = useQuestling();
  return (
    <div className="center-card world-builder-card">
      <h2>Turn notes into a realm</h2>
      <p>Upload a PDF for AI-grounded questions, or use the included environmental-science scenario.</p>
      {error && <div className="error-banner" role="alert">{error}</div>}
      <label className="story-upload">
        <input aria-label="Upload notes PDF" type="file" accept="application/pdf,.pdf" onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void uploadPdf(file);
          event.currentTarget.value = "";
        }} />
        <span>⇧</span><b>Upload Notes</b><small>PDF · up to 15 MB</small>
      </label>
      <div className="source-stack">
        {sources.map((source) => (
          <button key={source} onClick={() => setNotice(`${source} selected as active source`)}>
            <span>{source.endsWith("docx") ? "DOCX" : "PDF"}</span>{source}<b>✓</b>
          </button>
        ))}
      </div>
      <div className="button-row">
        <button className="story-button" onClick={() => navigate("source-library")}>View Library</button>
        <button className="story-button story-button--primary" onClick={beginDemo}>Build Demo Realm</button>
      </div>
      <small>♙ Only you can access your materials</small>
    </div>
  );
}

export function ProcessingScreen() {
  const { pack, processingStep, navigate } = useQuestling();
  return (
    <div className="processing-layout">
      <div className="story-panel processing-card">
        <span className="leaf-seal">♧</span>
        <h2>Building the {pack.topics[0]} Realm</h2>
        {PROCESSING_STEPS.map((step, index) => (
          <div className={`processing-row ${index <= processingStep ? "done" : ""}`} key={step}>
            <span>{index <= processingStep ? "✓" : "○"}</span>{step}
          </div>
        ))}
        <Meter value={(processingStep + 1) * 25} />
        <strong>{(processingStep + 1) * 25}%</strong>
        {processingStep === 3 && <button className="story-button story-button--primary" onClick={() => navigate("first-steps")}>Enter the Realm</button>}
      </div>
      <div className="realm-awakening-art"><span>✦</span><p>Every verified topic becomes a path, quest, or encounter.</p></div>
    </div>
  );
}

export function FirstStepsScreen() {
  const { navigate, pack } = useQuestling();
  return (
    <div className="exploration-layout">
      <ExplorerPair />
      <div className="hotspot-cluster">
        <button className="world-hotspot world-hotspot--archive" onClick={() => navigate("discover")}><span>✦</span><b>Archive Gate</b><small>Discover a source fragment</small></button>
        <button className="world-hotspot world-hotspot--journal" onClick={() => navigate("quest-journal")}><span>▤</span><b>Quest Journal</b><small>Track objectives</small></button>
        <button className="world-hotspot world-hotspot--sanctuary" onClick={() => navigate("sanctuary")}><span>♧</span><b>Sanctuary</b><small>Visit companions</small></button>
      </div>
      <aside className="home-hud" aria-label="Home shortcuts">
        <div className="story-panel home-hud__profile">
          <p className="eyebrow">ACTIVE QUEST · LEVEL 7</p>
          <h2>Walk to the Archive Gate</h2>
          <p>Choose a glowing location. Your avatar and Lumi move together through the realm.</p>
          <div className="home-hud__stats">
            <span><strong>{pack.questions.length}</strong> questions</span>
            <span><strong>61%</strong> mastery</span>
            <span><strong>Lv. 4</strong> Lumi bond</span>
          </div>
          <div className="home-progress"><span>Today&apos;s path</span><b>7 / 10 questions</b><Meter value={70} /></div>
          <button className="story-button" onClick={() => navigate("title")}>Account & onboarding</button>
        </div>
        <nav className="home-nav-grid" aria-label="Realm destinations">
          <button className="home-nav-card" onClick={() => navigate("source-library")}><span>▰</span><b>Source Library</b><small>Manage learning material</small></button>
          <button className="home-nav-card" onClick={() => navigate("sanctuary")}><span>♧</span><b>Companions</b><small>Bond and build a team</small></button>
          <button className="home-nav-card" onClick={() => navigate("mastery")}><span>◎</span><b>Mastery Atlas</b><small>Find topics to review</small></button>
          <button className="home-nav-card" onClick={() => navigate("journey")}><span>☽</span><b>Journey</b><small>View weekly progress</small></button>
        </nav>
      </aside>
      <div className="click-guide">Click a glowing destination to move there</div>
    </div>
  );
}

export function PauseScreen() {
  const { previousGameScreen, navigate } = useQuestling();
  const destinations = [
    ["▶", "Resume", previousGameScreen],
    ["⌂", "First Steps Home", "first-steps"],
    ["▤", "Quest Journal", "quest-journal"],
    ["▰", "Source Library", "source-library"],
    ["♧", "Companions", "sanctuary"],
    ["⚙", "Settings", "settings"],
    ["◇", "Account & Onboarding", "title"],
  ] as const;
  return (
    <div className="pause-layout">
      <ExplorerPair compact />
      <div className="story-panel pause-menu">
        {destinations.map(([icon, label, target]) => (
          <button key={label} className={label === "Resume" ? "story-button story-button--primary" : "story-button"} onClick={() => navigate(target)}>
            {icon} {label}
          </button>
        ))}
        <small>✓ Saved just now</small>
      </div>
    </div>
  );
}
