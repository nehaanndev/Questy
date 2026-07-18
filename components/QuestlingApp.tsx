"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { demoPack } from "@/lib/demo";
import { initialBattleState, resolveAnswer } from "@/lib/battle";
import type { BattleState, QuestionPack, QuestQuestion } from "@/lib/types";

type Screen = "library" | "processing" | "realm" | "battle" | "results" | "review";
type Position = { x: number; y: number };

const processingSteps = ["Reading pages and handwriting", "Mapping topics", "Creating grounded questions", "Verifying every citation"];

const explorationZones = {
  cloister: {
    name: "Forgotten Cloister",
    detail: "Ancient study tablets hum beneath the ivy.",
    landmark: "Whispering Tablet",
    icon: "▱",
  },
  crossing: {
    name: "Mosswater Crossing",
    detail: "Fireflies gather above the moonwell path.",
    landmark: "Moonwell",
    icon: "◌",
  },
  heights: {
    name: "Archive Heights",
    detail: "The Warden's gate rises beyond the bridge.",
    landmark: "Archive Scout",
    icon: "♙",
  },
} as const;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function RuneMark({ small = false }: { small?: boolean }) {
  return <span className={small ? "rune-mark rune-mark--small" : "rune-mark"}>✦</span>;
}

export default function QuestlingApp() {
  const [screen, setScreen] = useState<Screen>("library");
  const [pack, setPack] = useState<QuestionPack>(demoPack);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [player, setPlayer] = useState<Position>({ x: 20, y: 76 });
  const [companion, setCompanion] = useState<Position>({ x: 15, y: 79 });
  const [battle, setBattle] = useState<BattleState>(initialBattleState);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [encounterReady, setEncounterReady] = useState(false);
  const keys = useRef(new Set<string>());
  const uploadController = useRef<AbortController | null>(null);
  const delayedRealmEntry = useRef<number | null>(null);

  const currentQuestion = pack.questions[battle.questionIndex] ?? pack.questions[0];
  const selectedCorrect = selectedIndex !== null && selectedIndex === currentQuestion.correctIndex;
  const explorationZone = player.x < 36
    ? explorationZones.cloister
    : player.x < 63
      ? explorationZones.crossing
      : explorationZones.heights;
  const cameraX = clamp((48 - player.x) * 0.24, -10, 10);
  const cameraY = clamp((58 - player.y) * 0.14, -5, 5);

  const startBattle = () => {
    setBattle(initialBattleState());
    setSelectedIndex(null);
    setSourceOpen(false);
    setScreen("battle");
  };

  const returnToLibrary = () => {
    uploadController.current?.abort();
    uploadController.current = null;
    if (delayedRealmEntry.current !== null) window.clearTimeout(delayedRealmEntry.current);
    delayedRealmEntry.current = null;
    setScreen("library");
  };

  useEffect(() => {
    const cached = window.localStorage.getItem("questling-question-pack");
    if (!cached) return;
    try {
      const restored = JSON.parse(cached) as QuestionPack;
      if (restored.questions?.length >= 4) {
        const timer = window.setTimeout(() => {
          setPack(restored);
          if (restored.generatedBy === "openai") setUploadedName(restored.sourceName);
        }, 0);
        return () => window.clearTimeout(timer);
      }
    } catch {
      window.localStorage.removeItem("questling-question-pack");
    }
  }, []);

  useEffect(() => () => {
    uploadController.current?.abort();
    if (delayedRealmEntry.current !== null) window.clearTimeout(delayedRealmEntry.current);
  }, []);

  useEffect(() => {
    function down(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
        event.preventDefault();
        keys.current.add(key);
      }
      if ((key === "e" || key === "enter") && screen === "realm" && encounterReady) {
        startBattle();
      }
    }

    function up(event: KeyboardEvent) {
      keys.current.delete(event.key.toLowerCase());
    }

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  });

  useEffect(() => {
    if (screen !== "realm") return;
    const timer = window.setInterval(() => {
      const active = keys.current;
      let dx = 0;
      let dy = 0;
      if (active.has("a") || active.has("arrowleft")) dx -= 1;
      if (active.has("d") || active.has("arrowright")) dx += 1;
      if (active.has("w") || active.has("arrowup")) dy -= 1;
      if (active.has("s") || active.has("arrowdown")) dy += 1;
      if (!dx && !dy) return;
      const magnitude = Math.hypot(dx, dy);
      setPlayer((position) => ({
        x: clamp(position.x + (dx / magnitude) * 1.2, 6, 92),
        y: clamp(position.y + (dy / magnitude) * 1.2, 30, 84),
      }));
    }, 32);
    return () => window.clearInterval(timer);
  }, [screen]);

  useEffect(() => {
    if (screen !== "realm") return;
    const timer = window.setInterval(() => {
      setCompanion((position) => {
        const targetX = player.x - 4;
        const targetY = player.y + 3;
        return {
          x: position.x + (targetX - position.x) * 0.12,
          y: position.y + (targetY - position.y) * 0.12,
        };
      });
      setEncounterReady(Math.hypot(player.x - 75, player.y - 43) < 15);
    }, 40);
    return () => window.clearInterval(timer);
  }, [player, screen]);

  const beginDemo = () => {
    setPack(demoPack);
    setUploadedName(null);
    setError(null);
    window.localStorage.setItem("questling-question-pack", JSON.stringify(demoPack));
    enterRealm();
  };

  const enterRealm = () => {
    setPlayer({ x: 20, y: 76 });
    setCompanion({ x: 15, y: 79 });
    setBattle(initialBattleState());
    setSelectedIndex(null);
    setScreen("realm");
  };

  async function uploadPdf(file: File) {
    uploadController.current?.abort();
    const controller = new AbortController();
    uploadController.current = controller;
    setError(null);
    setUploadedName(file.name);
    setProcessingStep(0);
    setScreen("processing");

    const timer = window.setInterval(() => {
      setProcessingStep((step) => Math.min(processingSteps.length - 1, step + 1));
    }, 2200);

    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/generate-questions", { method: "POST", body, signal: controller.signal });
      const payload = (await response.json()) as { pack?: QuestionPack; error?: string; detail?: string };
      if (!response.ok || !payload.pack) {
        throw new Error(payload.error ?? "The realm could not be created.");
      }
      setPack(payload.pack);
      window.localStorage.setItem("questling-question-pack", JSON.stringify(payload.pack));
      setProcessingStep(processingSteps.length - 1);
      delayedRealmEntry.current = window.setTimeout(() => {
        if (!controller.signal.aborted) enterRealm();
      }, 650);
    } catch (uploadError) {
      if (controller.signal.aborted) return;
      setError(uploadError instanceof Error ? uploadError.message : "The realm could not be created.");
      setScreen("library");
    } finally {
      window.clearInterval(timer);
      if (uploadController.current === controller) uploadController.current = null;
    }
  }

  const move = (dx: number, dy: number) => {
    setPlayer((position) => {
      const next = {
        x: clamp(position.x + dx, 6, 92),
        y: clamp(position.y + dy, 30, 84),
      };
      setEncounterReady(Math.hypot(next.x - 75, next.y - 43) < 15);
      return next;
    });
  };

  const continueAfterAnswer = () => {
    if (selectedIndex === null) return;
    const nextBattle = resolveAnswer(battle, currentQuestion, selectedIndex, pack.questions.length);
    setBattle(nextBattle);
    setSelectedIndex(null);
    setSourceOpen(false);
    if (nextBattle.status !== "playing") setScreen("results");
  };

  const answerReview = useMemo(() => {
    return battle.answers.map((answer) => ({
      answer,
      question: pack.questions.find((question) => question.id === answer.questionId) as QuestQuestion,
    }));
  }, [battle.answers, pack.questions]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={returnToLibrary} aria-label="Return to Source Library">
          <RuneMark />
          <span>Questling</span>
        </button>
        <div className="topbar__status">
          <span className="status-dot" />
          {pack.generatedBy === "openai" ? "AI-grounded realm" : "Demo realm"}
          <span className="divider" />
          <span>{pack.sourceName}</span>
        </div>
        {screen !== "library" && screen !== "processing" && (
          <button className="ghost-button" onClick={returnToLibrary}>Source Library</button>
        )}
      </header>

      {screen === "library" && (
        <section className="library-screen">
          <div className="library-hero">
            <p className="eyebrow">YOUR NOTES BECOME THE WORLD</p>
            <h1>Begin with a trusted source.</h1>
            <p className="hero-copy">
              Upload a PDF. Questling reads its pages, builds a grounded question pack, and threads those questions directly into exploration and combat.
            </p>

            {error && <div className="error-banner" role="alert">{error}</div>}

            <div className="source-actions">
              <label className="upload-card">
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadPdf(file);
                    event.currentTarget.value = "";
                  }}
                />
                <span className="upload-card__icon">⇧</span>
                <strong>Upload a PDF</strong>
                <span>Handwritten scans work best when pages are clear.</span>
                <small>PDF · up to 15 MB · private server-side processing</small>
              </label>

              <article className="demo-card">
                <div className="demo-card__preview" aria-hidden="true">
                  <Image src="/assets/demo-notes-1.jpg" alt="" width={573} height={1280} />
                  <Image src="/assets/demo-notes-2.jpg" alt="" width={573} height={1280} />
                </div>
                <div className="demo-card__body">
                  <span className="source-chip">BASE SCENARIO</span>
                  <h2>Environmental Science Notes</h2>
                  <p>LD50, biomagnification, irrigation, groundwater, and saltwater intrusion.</p>
                  <div className="topic-row">
                    <span>6 questions</span><span>4 topics</span><span>2 note pages</span>
                  </div>
                  <button className="primary-button" onClick={beginDemo}>Enter demo realm</button>
                </div>
              </article>
            </div>

            {uploadedName && pack.generatedBy === "openai" && (
              <button className="resume-card" onClick={enterRealm}>
                <RuneMark small />
                <span><strong>Resume {pack.title}</strong><small>{uploadedName} · {pack.questions.length} verified questions</small></span>
                <span>Continue →</span>
              </button>
            )}
          </div>
          <aside className="library-aside">
            <div className="trust-card">
              <p className="eyebrow">GROUNDING RULES</p>
              <h2>No citation, no question.</h2>
              <ol>
                <li><span>01</span> Read text, handwriting, tables, and diagrams</li>
                <li><span>02</span> Generate four-choice questions</li>
                <li><span>03</span> Attach a page and evidence quote</li>
                <li><span>04</span> Reject ambiguous or duplicate content</li>
              </ol>
            </div>
          </aside>
        </section>
      )}

      {screen === "processing" && (
        <section className="processing-screen" aria-live="polite">
          <div className="realm-orb"><div /><RuneMark /></div>
          <p className="eyebrow">REALM AWAKENING</p>
          <h1>Building from {uploadedName}</h1>
          <p>Handwritten pages receive high-detail visual processing. This can take about a minute.</p>
          <div className="processing-list">
            {processingSteps.map((step, index) => (
              <div key={step} className={index < processingStep ? "done" : index === processingStep ? "active" : ""}>
                <span>{index < processingStep ? "✓" : index + 1}</span>{step}
              </div>
            ))}
          </div>
        </section>
      )}

      {screen === "realm" && (
        <section className="game-screen exploration" aria-label="Exploration realm">
          <div
            className="game-background exploration-background"
            data-testid="exploration-camera"
            style={{ transform: `scale(1.3) translate(${cameraX}%, ${cameraY}%)` }}
          />
          <div
            className="world-parallax world-parallax--far"
            aria-hidden="true"
            style={{ transform: `translate(${cameraX * 1.6}%, ${cameraY * 1.15}%)` }}
          >
            <i /><i /><i /><i /><i />
          </div>
          <div
            className="world-parallax world-parallax--near"
            aria-hidden="true"
            style={{ transform: `translate(${cameraX * 2.4}%, ${cameraY * 1.7}%)` }}
          >
            <i /><i /><i />
          </div>
          <div className="vignette" />
          <div className="hud player-hud">
            <span className="portrait">A</span>
            <div><strong>Level 7</strong><span className="meter"><i style={{ width: "78%" }} /></span></div>
          </div>
          <div className="hud minimap">
            <span
              className="minimap-arrow"
              style={{ transform: `translate(${(player.x - 50) * 0.42}px, ${(player.y - 57) * 0.42}px)` }}
            >▲</span>
            <i />
          </div>
          <div className="zone-banner" aria-live="polite">
            <small>NOW EXPLORING</small>
            <strong>{explorationZone.name}</strong>
            <span>{explorationZone.detail}</span>
          </div>
          <div className="world-landmark" key={explorationZone.name}>
            <span>{explorationZone.icon}</span>
            <div><strong>{explorationZone.landmark}</strong><small>{explorationZone.name}</small></div>
          </div>
          <div className="quest-card">
            <span className="source-chip">ACTIVE QUEST</span>
            <h2>{pack.title}</h2>
            <p>Follow the archive light and confront the Verdant Warden.</p>
            <small>{pack.sourceName} · {pack.questions.length} questions ready</small>
          </div>
          <div className="archive-beacon" style={{ left: "75%", top: "43%" }}>
            <span>✦</span><small>Archive Gate</small>
          </div>
          <div className="movable-avatar" style={{ left: `${player.x}%`, top: `${player.y}%` }} aria-label="Your movable avatar">
            <span className="avatar-head" /><span className="avatar-body" /><small>You</small>
          </div>
          <div className="moving-companion" style={{ left: `${companion.x}%`, top: `${companion.y}%` }} aria-label="Lumi following">
            <span className="ear left-ear" /><span className="ear right-ear" /><span className="companion-face">•ᴗ•</span><small>Lumi</small>
          </div>

          <div className="move-pad" aria-label="Movement controls">
            <button onPointerDown={() => move(0, -4)} aria-label="Move up">▲</button>
            <button onPointerDown={() => move(-4, 0)} aria-label="Move left">◀</button>
            <button onPointerDown={() => move(4, 0)} aria-label="Move right">▶</button>
            <button onPointerDown={() => move(0, 4)} aria-label="Move down">▼</button>
          </div>
          <div className="controls-hint">WASD / arrows to move · Lumi follows you</div>
          <button className={encounterReady ? "encounter-button ready" : "encounter-button"} onClick={startBattle} disabled={!encounterReady}>
            <RuneMark small /> {encounterReady ? "Enter encounter · E" : "Approach the Archive Gate"}
          </button>
        </section>
      )}

      {screen === "battle" && currentQuestion && (
        <section className="game-screen battle-screen" aria-label="Tactical study encounter">
          <div className="game-background battle-background" />
          <div className="battle-shade" />
          <div className="enemy-status">
            <div><span>VERDANT WARDEN</span><small>Lv. 8</small></div>
            <span className="meter enemy-meter"><i style={{ width: `${battle.enemyHp}%` }} /></span>
            <label>BREAK <span className="break-track"><i style={{ width: `${battle.breakMeter}%` }} /></span></label>
          </div>
          <div className="battle-player-status">
            <strong>Lumi</strong><span>{battle.playerHp} / 100</span>
            <span className="meter"><i style={{ width: `${battle.playerHp}%` }} /></span>
            <small>TACTICIAN · {"◆".repeat(battle.actionSegments)}{"◇".repeat(3 - battle.actionSegments)}</small>
          </div>
          <div className="command-menu" aria-label="Battle commands">
            <button disabled title="Coming in a later build">STRIKE</button>
            <button disabled title="Coming in a later build">WARD</button>
            <button disabled className="selected" title="Study ability active">ABILITY</button>
            <button disabled title="Coming in a later build">ITEM</button>
          </div>
          <div className="question-panel">
            <div className="question-heading">
              <div><p className="eyebrow">POWER THE ABILITY</p><h1>{currentQuestion.prompt}</h1></div>
              <span>Question {battle.questionIndex + 1} of {pack.questions.length}</span>
            </div>
            <div className="answers-grid">
              {currentQuestion.choices.map((choice, index) => (
                <button
                  key={choice}
                  className={selectedIndex === index ? (selectedCorrect ? "answer correct" : "answer incorrect") : "answer"}
                  disabled={selectedIndex !== null}
                  onClick={() => setSelectedIndex(index)}
                >
                  <span>{String.fromCharCode(65 + index)}</span>{choice}
                </button>
              ))}
            </div>
            {selectedIndex === null ? (
              <div className="question-footer">
                <button className="source-link" onClick={() => setSourceOpen((open) => !open)}>▣ {pack.sourceName} · {currentQuestion.evidence.pageLabel}</button>
                <span>Correct: fill an action segment and damage BREAK</span>
              </div>
            ) : (
              <div className={selectedCorrect ? "feedback feedback--correct" : "feedback feedback--incorrect"} role="status">
                <div><strong>{selectedCorrect ? "Focus aligned" : "The Warden interrupts"}</strong><p>{currentQuestion.explanation}</p></div>
                <button onClick={() => setSourceOpen((open) => !open)}>View source</button>
                <button className="primary-button" onClick={continueAfterAnswer}>Continue</button>
              </div>
            )}
            {sourceOpen && (
              <aside className="source-drawer">
                <button onClick={() => setSourceOpen(false)} aria-label="Close source">×</button>
                <p className="eyebrow">SOURCE EVIDENCE · {currentQuestion.evidence.pageLabel}</p>
                <blockquote>“{currentQuestion.evidence.quote}”</blockquote>
                <small>{pack.sourceName}</small>
              </aside>
            )}
          </div>
        </section>
      )}

      {screen === "results" && (
        <section className="results-screen">
          <div className="results-visual"><div className="results-glow"><RuneMark /></div></div>
          <div className="results-card">
            <p className="eyebrow">QUEST COMPLETE</p>
            <h1>{battle.status === "won" ? "The archive opens." : "The archive remains sealed."}</h1>
            <p>{battle.status === "won" ? "Your answers broke the Warden's guard and restored the source fragment." : "Review the evidence, then challenge the Warden again."}</p>
            <div className="score-ring"><strong>{battle.correctCount}</strong><span>/ {pack.questions.length} correct</span></div>
            <div className="reward-row"><span>Mastery <strong>+{battle.correctCount * 3}</strong></span><span>Bond <strong>+{battle.correctCount * 2}</strong></span><span>Archive Key <strong>{battle.status === "won" ? "earned" : "locked"}</strong></span></div>
            <div className="result-actions">
              <button className="secondary-button" onClick={() => setScreen("review")}>Review answers</button>
              <button className="primary-button" onClick={battle.status === "won" ? enterRealm : startBattle}>{battle.status === "won" ? "Continue journey" : "Retry encounter"}</button>
            </div>
          </div>
        </section>
      )}

      {screen === "review" && (
        <section className="review-screen">
          <div className="review-header">
            <div><p className="eyebrow">ANSWER REVIEW</p><h1>Trace every answer to its source.</h1></div>
            <button className="primary-button" onClick={() => setScreen("results")}>Done</button>
          </div>
          <div className="review-list">
            {answerReview.map(({ answer, question }, index) => (
              <article key={answer.questionId} className={answer.correct ? "review-item correct" : "review-item incorrect"}>
                <span className="review-number">{index + 1}</span>
                <div>
                  <h2>{question.prompt}</h2>
                  <p>Your answer: <strong>{question.choices[answer.selectedIndex]}</strong></p>
                  {!answer.correct && <p>Correct answer: <strong>{question.choices[question.correctIndex]}</strong></p>}
                  <p className="review-explanation">{question.explanation}</p>
                  <blockquote>“{question.evidence.quote}”</blockquote>
                  <small>{pack.sourceName} · {question.evidence.pageLabel}</small>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
