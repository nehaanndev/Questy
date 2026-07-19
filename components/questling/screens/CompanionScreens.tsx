import { CREATURES, useQuestling } from "../core/QuestlingProvider";
import { ExplorerPair, Tabs } from "../core/primitives";
import { QuestlingArt, QuestlingArtCard } from "../art/QuestlingArt";

export function SanctuaryScreen() {
  const {
    sanctuaryMessage, selectedCreature, setSelectedCreature, setSanctuaryMessage,
    setBondLevel, navigate,
  } = useQuestling();
  return (
    <div className="sanctuary-layout">
      <ExplorerPair />
      <div className="sanctuary-art-grid">
        {CREATURES.slice(0, 3).map((creature, index) => creature.artId ? (
          <QuestlingArtCard key={creature.name} id={creature.artId} crop="portrait" cardClassName="questling-art-card" selected={selectedCreature === index} meta={`Bond Lv. ${creature.bond}`} onClick={() => { setSelectedCreature(index); navigate("codex"); }} />
        ) : null)}
      </div>
      <div className="story-panel sanctuary-actions">
        <p>{sanctuaryMessage}</p>
        {["Call", "Feed", "Train"].map((action) => (
          <button className="story-button" key={action} onClick={() => {
            setSanctuaryMessage(action === "Call" ? `${CREATURES[selectedCreature].name} trots over.` : action === "Feed" ? "Bond increased with a favorite treat." : "Training complete: Focus +1.");
            if (action === "Feed") setBondLevel((level) => Math.min(5, level + 1));
          }}>{action}</button>
        ))}
        <button className="story-button" onClick={() => navigate("team")}>Team Setup</button>
        <button className="story-button story-button--primary" onClick={() => navigate("codex")}>Open Codex · 8 / 48</button>
      </div>
    </div>
  );
}

export function CodexScreen() {
  const { codexTab, setCodexTab, selectedCreature, setSelectedCreature, team, toggleTeam, navigate } = useQuestling();
  const filtered = codexTab === "All" ? CREATURES : CREATURES.filter((creature) => creature.type === codexTab);
  const chosen = CREATURES[selectedCreature];
  function changeHabitat(tab: string) {
    setCodexTab(tab);
    const firstMatch = tab === "All" ? 0 : CREATURES.findIndex((creature) => creature.type === tab);
    if (firstMatch >= 0) setSelectedCreature(firstMatch);
  }
  return (
    <div className="codex-layout">
      <div className="story-panel codex-grid">
        <p>{CREATURES.length} / 48 discovered</p>
        <Tabs items={["All", "Forest", "Water", "Ruins"]} active={codexTab} onChange={changeHabitat} label="Companion habitats" />
        <div className="creature-grid">
          {filtered.map((creature) => {
            const index = CREATURES.indexOf(creature);
            return creature.artId ? (
              <QuestlingArtCard key={creature.name} id={creature.artId} crop="portrait" cardClassName="questling-art-card" selected={selectedCreature === index} onClick={() => setSelectedCreature(index)} />
            ) : (
              <button key={creature.name} className={selectedCreature === index ? "active" : ""} onClick={() => setSelectedCreature(index)}><span>{creature.icon}</span><b>{creature.name}</b></button>
            );
          })}
        </div>
      </div>
      <div className="story-panel creature-detail">
        <h2>{chosen.name}</h2>{chosen.artId ? <QuestlingArt id={chosen.artId} crop="full" className="creature-detail-art" /> : <span className="creature-hero">{chosen.icon}</span>}<h3>✦ {chosen.role}</h3>
        <p>Bond Lv. {chosen.bond}</p><div>{"◆".repeat(chosen.bond)}{"◇".repeat(5 - chosen.bond)}</div>
        <div className="button-row">
          <button className="story-button" onClick={() => navigate("bond")}>Bond Path</button>
          <button className="story-button story-button--primary" onClick={() => toggleTeam(selectedCreature)}>{team.includes(selectedCreature) ? "Remove from Team" : "Add to Team"}</button>
        </div>
      </div>
    </div>
  );
}

export function BondScreen() {
  const { selectedCreature, bondLevel, setBondLevel, setNotice } = useQuestling();
  const chosen = CREATURES[selectedCreature];
  return (
    <div className="bond-layout">
      <ExplorerPair />
      <div className="story-panel bond-card">
        <div className="bond-title">{chosen.artId ? <QuestlingArt id={chosen.artId} crop="portrait" className="bond-creature-art" /> : <span>{chosen.icon}</span>}<div><h2>{chosen.name}</h2><p>Bond Lv. {bondLevel}</p><div>{"◆".repeat(bondLevel)}{"◇".repeat(5 - bondLevel)}</div></div></div>
        <div className="bond-path"><div><span>◉</span><b>Curious</b></div>{["Shared Focus", "Archive Sense", "Chain Assist"].map((skill) => <button key={skill} onClick={() => setNotice(`${skill} selected on ${chosen.name}'s bond path`)}>✦ {skill}</button>)}</div>
        <button className="story-button story-button--primary" onClick={() => { setBondLevel((level) => Math.min(5, level + 1)); setNotice(`You spent time with ${chosen.name}`); }}>♥ Spend Time</button>
      </div>
    </div>
  );
}

export function TeamScreen() {
  const { team, toggleTeam, setNotice } = useQuestling();
  return (
    <div className="team-layout">
      <div className="team-title"><span /> Active Team ({team.length} / 3) <span /></div>
      <div className="active-team">
        {CREATURES.slice(0, 4).map((creature, index) => creature.artId ? (
          <QuestlingArtCard key={creature.name} id={creature.artId} crop="portrait" cardClassName="questling-art-card" selected={team.includes(index)} meta={team.includes(index) ? "✓ Active" : "Add to team"} onClick={() => toggleTeam(index)} />
        ) : (
          <button key={creature.name} className={team.includes(index) ? "active" : ""} onClick={() => toggleTeam(index)}>
            <span>{creature.icon}</span><b>{creature.name}</b><small>{creature.role}</small><i>{team.includes(index) ? "✓ Active" : "Add"}</i>
          </button>
        ))}
      </div>
      <div className="story-panel bench"><p>Bench · click to swap</p>{CREATURES.slice(4).map((creature, index) => <button key={creature.name} onClick={() => toggleTeam(index + 4)}><span>{creature.icon}</span>{creature.name}</button>)}</div>
      <button className="story-button story-button--primary" onClick={() => setNotice(`Team saved with ${team.length} companions`)}>♢ Save Team</button>
    </div>
  );
}
