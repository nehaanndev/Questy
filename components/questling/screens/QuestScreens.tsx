import Image from "next/image";
import { useQuestling } from "../core/QuestlingProvider";
import { ExplorerPair, Meter, Rune } from "../core/primitives";
import { QuestlingArt } from "../art/QuestlingArt";

export function QuestJournalScreen() {
  const { quest, setQuest, tracked, setTracked, setNotice, startBattle } = useQuestling();
  const quests = ["The Forgotten Archive", "Echoes of the Cell", "Weak Topic: Mitochondria"];
  return (
    <div className="journal-layout">
      <div className="story-panel quest-list">
        <h2>Quests</h2>
        {quests.map((item, index) => (
          <button className={quest === item ? "active" : ""} key={item} onClick={() => setQuest(item)}>
            <span>{index === 0 ? "✦" : index === 1 ? "♧" : "△"}</span><b>{item}</b>
            <small>{index === 0 ? "In progress" : index === 1 ? "Available" : "Recommended"}</small>
          </button>
        ))}
      </div>
      <div className="map-panel">
        <div className="map-path">
          {["Canal Village", "Forest", "Ruined Archive", "Mountain Lake"].map((place) => (
            <button key={place} onClick={() => setNotice(`${place} selected on the quest map`)}>{place}<span>✦</span></button>
          ))}
        </div>
        <div className="story-panel quest-detail-card">
          <p className="eyebrow">{quest}</p><h2>{quest}</h2>
          <p>{quest === "The Forgotten Archive" ? "Follow the light to the old library and uncover what was lost." : "A focused study route generated from your active notes."}</p>
          <ul><li>✓ Reach the Archive Gate</li><li>○ Explore the Archive</li><li>○ Answer the Archive Trial</li></ul>
          <div className="button-row">
            <button className="story-button" onClick={() => { setTracked((value) => !value); setNotice(tracked ? "Quest untracked" : "Quest tracked"); }}>{tracked ? "Untrack Quest" : "Track Quest"}</button>
            <button className="story-button story-button--primary" onClick={startBattle}>Start Encounter</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DiscoverScreen() {
  const { currentQuestion, pack, clueSaved, setClueSaved, setNotice, navigate } = useQuestling();
  return (
    <div className="discover-layout">
      <ExplorerPair compact />
      <div className="story-panel dialogue-card">
        <div className="npc-line"><span>◎</span><div><b>Archivist Liora</b><p>The ancients recorded knowledge in living murals. Observe closely.</p></div></div>
        <p className="eyebrow">♧ SOURCE FRAGMENT</p>
        <h2>{currentQuestion.evidence.quote}</h2>
        <small>{pack.sourceName} · {currentQuestion.evidence.pageLabel}</small>
        <div className="button-row">
          <button className={clueSaved ? "story-button active" : "story-button"} onClick={() => { setClueSaved((value) => !value); setNotice(clueSaved ? "Clue removed" : "Clue saved to journal"); }}>{clueSaved ? "✓ Clue Saved" : "▤ Save Clue"}</button>
          <button className="story-button story-button--primary" onClick={() => navigate("quest-journal")}>✦ Continue</button>
        </div>
      </div>
    </div>
  );
}

export function BattleScreen() {
  const {
    battle, activeCommand, setActiveCommand, setNotice, currentQuestion, pack,
    selectedIndex, setSelectedIndex, selectedCorrect, navigate, continueAfterAnswer,
  } = useQuestling();
  return (
    <div className="battle-layout">
      <div className="battle-status battle-status--player"><b>Lumi</b><span>{battle.playerHp} / 100</span><Meter value={battle.playerHp} /><small>TACTICIAN · {"◆".repeat(battle.actionSegments)}{"◇".repeat(3 - battle.actionSegments)}</small></div>
      <div className="battle-status battle-status--enemy"><b>Verdant Guardian <small>Lv. 8</small></b><span>{battle.enemyHp} / 100</span><Meter value={battle.enemyHp} /><label>BREAK <Meter value={battle.breakMeter} tone="gold" /></label></div>
      <ExplorerPair compact />
      <div className="guardian-art"><QuestlingArt id="verdant-warden" crop="battle" className="guardian-art-image" priority /><b>VERDANT GUARDIAN</b></div>
      <div className="battle-commands" aria-label="Battle commands">
        {["Strike", "Ward", "Ability", "Item"].map((command) => (
          <button key={command} className={activeCommand === command ? "active" : ""} onClick={() => { setActiveCommand(command); setNotice(command === "Ability" ? "Answer to power the ability" : `${command} command selected`); }}>{command}</button>
        ))}
      </div>
      <div className="story-panel question-card">
        <p className="eyebrow">{activeCommand === "Ability" ? "✦ POWER THE ABILITY" : `${activeCommand.toUpperCase()} COMMAND`}</p>
        {activeCommand === "Ability" ? (
          <>
            <div className="question-title"><h2>{currentQuestion.prompt}</h2><span>Question {battle.questionIndex + 1} of {pack.questions.length}</span></div>
            <div className="battle-answers">
              {currentQuestion.choices.map((choice, index) => (
                <button key={choice} disabled={selectedIndex !== null} className={selectedIndex === index ? (selectedCorrect ? "correct" : "incorrect") : ""} onClick={() => setSelectedIndex(index)}>
                  <span>{String.fromCharCode(65 + index)}</span>{choice}
                </button>
              ))}
            </div>
            {selectedIndex === null ? (
              <div className="question-meta"><button onClick={() => navigate("source-details")}>▤ {pack.sourceName} · {currentQuestion.evidence.pageLabel}</button><span>Correct answers fill action segments</span></div>
            ) : (
              <div className={selectedCorrect ? "battle-feedback correct" : "battle-feedback incorrect"} role="status">
                <p><b>{selectedCorrect ? "Focus aligned" : "The guardian interrupts"}</b> — {currentQuestion.explanation}</p>
                <button className="story-button" onClick={() => navigate("source-details")}>View Source</button>
                <button className="story-button story-button--primary" onClick={continueAfterAnswer}>Continue</button>
              </div>
            )}
          </>
        ) : (
          <div className="command-effect">
            <h2>{activeCommand} is ready.</h2>
            <p>{activeCommand === "Strike" ? "Deal light damage without spending a study charge." : activeCommand === "Ward" ? "Reduce damage from the next incorrect answer." : "Use a collected relic from your inventory."}</p>
            <button className="story-button story-button--primary" onClick={() => { setNotice(`${activeCommand} prepared`); setActiveCommand("Ability"); }}>Prepare {activeCommand}</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ResultsScreen() {
  const { battle, setSelectedItem, navigate } = useQuestling();
  const score = battle.answers.length ? battle.correctCount : 7;
  const total = battle.answers.length ? battle.answers.length : 8;
  return (
    <div className="results-layout">
      <ExplorerPair />
      <div className="story-panel results-summary">
        <Rune /><h2>Quest Complete</h2><div className="score-line">✓ <strong>{score} / {total} correct</strong></div>
        <div className="reward-grid"><span>✦ Mastery +{score + 5}</span><span>♥ Bond +{Math.max(4, score)}</span></div>
        <button className="reward-item" onClick={() => { setSelectedItem("Archive Key"); navigate("inventory"); }}><span>⚿</span><b>Archive Key</b><small>Added to your inventory</small></button>
        <p>△ Review: Cell respiration</p>
        <div className="button-row"><button className="story-button" onClick={() => navigate("review")}>▤ Review Answers</button><button className="story-button story-button--primary" onClick={() => navigate("journey")}>✦ Continue Journey</button></div>
      </div>
    </div>
  );
}

export function MasteryScreen() {
  const { masteryTopic, setMasteryTopic, startBattle } = useQuestling();
  const topics = [{ name: "Cell structure", value: 82 }, { name: "Mitochondria", value: 61 }, { name: "ATP", value: 54 }, { name: "Genetics", value: 76 }];
  return (
    <div className="mastery-layout">
      <div className="mastery-web">
        {topics.map((topic, index) => <button key={topic.name} className={`mastery-node mastery-node--${index}`} onClick={() => setMasteryTopic(topic.name)}><span>{index === 0 ? "◉" : index === 1 ? "◎" : index === 2 ? "ϟ" : "⌘"}</span><b>{topic.name}</b><small>{topic.value}%</small></button>)}
      </div>
      <div className="story-panel mastery-detail"><p className="eyebrow">♧ RECOMMENDED REVIEW</p><h2>{masteryTopic}</h2><p>Your mastery is lower in this area. Review to strengthen your knowledge.</p><ul><li>4 key concepts</li><li>6 related questions</li></ul><button className="story-button story-button--primary" onClick={startBattle}>✦ Start Review Quest</button></div>
    </div>
  );
}

export function ReviewScreen() {
  const { answerReview, currentQuestion, pack, setNotice, navigate } = useQuestling();
  const review = answerReview[0];
  const question = review?.question ?? currentQuestion;
  const answer = review?.answer;
  return (
    <div className="review-layout">
      <div className="story-panel review-card">
        <p className="eyebrow">Question 1 of {Math.max(1, answerReview.length)}</p><h2>{question.prompt}</h2>
        <p className="wrong-line">⊗ Your answer: {answer ? question.choices[answer.selectedIndex] : "Nucleus"}</p>
        <p className="right-line">✓ Correct answer: {question.choices[question.correctIndex]}</p>
        <div className="explanation-box"><h3>Explanation</h3><p>{question.explanation}</p></div>
        <div className="source-excerpt"><h3>Source Excerpt</h3><small>{pack.sourceName} · {question.evidence.pageLabel}</small><blockquote>“{question.evidence.quote}”</blockquote></div>
        <div className="button-row"><button className="story-button" onClick={() => navigate("source-details")}>▤ Open Page</button><button className="story-button" onClick={() => setNotice("Question flagged for review")}>△ Report Question</button><button className="story-button story-button--primary" onClick={() => navigate("results")}>✓ Got It</button></div>
      </div>
      <div className="review-page"><Image src="/assets/demo-notes-1.jpg" alt="Cited source page" width={573} height={1280} /></div>
    </div>
  );
}

export function JourneyScreen() {
  const { setNotice, navigate } = useQuestling();
  const goals = [["Complete one review quest", 100, "1 / 1"], ["Answer 10 questions", 70, "7 / 10"], ["Spend time with a companion", 75, "15 / 20 min"]] as const;
  return (
    <div className="journey-layout">
      <ExplorerPair />
      <div className="story-panel journey-card"><h2>7 day journey</h2>
        <div className="day-path">{[1, 2, 3, 4, 5, 6, 7].map((day) => <button key={day} onClick={() => setNotice(`Day ${day} selected`)} className={day <= 4 ? "done" : ""}>{day <= 3 ? "✓" : day === 4 ? "✦" : "○"}</button>)}</div>
        {goals.map(([label, value, count]) => <button className="goal-row" key={label} onClick={() => label.includes("companion") ? navigate("bond") : navigate("quest-journal")}><span>{label}</span><Meter value={value} /><b>{count}</b></button>)}
        <div className="achievement-row"><span>♧</span><div><h3>Archive Seeker</h3><p>Answer 50 questions from the Source Library.</p><Meter value={74} /></div><b>37 / 50</b></div>
        <button className="story-button story-button--primary" onClick={() => navigate("quest-journal")}>▤ View Journal</button>
      </div>
    </div>
  );
}
