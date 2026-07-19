import { useId, type KeyboardEvent, type ReactNode } from "react";
import { QuestlingArt } from "../art/QuestlingArt";
import { SCREEN_IDS, SCREEN_TITLES, type Scene, type Screen } from "./config";

export function Rune({ small = false }: { small?: boolean }) {
  return <span className={small ? "story-rune story-rune--small" : "story-rune"}>✦</span>;
}

export function SceneFrame({
  screen,
  scene = "archive",
  children,
  onPause,
  onHome,
  status,
}: {
  screen: Screen;
  scene?: Scene;
  children: ReactNode;
  onPause?: () => void;
  onHome: () => void;
  status?: string;
}) {
  const number = SCREEN_IDS.indexOf(screen) + 1;
  return (
    <section className={`story-screen story-screen--${scene}`} data-testid={`screen-${screen}`}>
      <div className="story-screen__wash" />
      <header className="story-heading">
        <button className="story-brand" onClick={onHome} aria-label="Go to First Steps home">
          <Rune small /> Questling
        </button>
        <h1>{screen !== "avatar-create" && <span>{String(number).padStart(2, "0")}</span>} {SCREEN_TITLES[screen]}</h1>
        <div className="story-heading__tools">
          {status && <span className="story-status" role="status" aria-live="polite">● {status}</span>}
          {onPause && screen !== "pause" && (
            <button className="icon-button" onClick={onPause} aria-label="Open pause menu">☰</button>
          )}
        </div>
      </header>
      <div className="story-content">{children}</div>
    </section>
  );
}

export function Tabs({
  items,
  active,
  onChange,
  label,
}: {
  items: string[];
  active: string;
  onChange: (tab: string) => void;
  label: string;
}) {
  const tabSetId = useId();

  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const offset = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + offset + items.length) % items.length;
    onChange(items[nextIndex]);
    const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("[role=tab]");
    buttons?.[nextIndex]?.focus();
  }

  return (
    <div className="story-tabs" role="tablist" aria-label={label}>
      {items.map((item, index) => (
        <button
          key={item}
          id={`${tabSetId}-tab-${index}`}
          role="tab"
          aria-selected={active === item}
          tabIndex={active === item ? 0 : -1}
          className={active === item ? "active" : ""}
          onClick={() => onChange(item)}
          onKeyDown={(event) => moveFocus(event, index)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export function ExplorerPair({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "explorer-pair explorer-pair--compact" : "explorer-pair"} aria-label="Your avatar and Lumi">
      <QuestlingArt id="pathfinder" crop="full" className="questling-scene-avatar" priority />
      <QuestlingArt id="starlight-fennec" crop="full" className="questling-scene-companion" priority />
    </div>
  );
}

export function Meter({ value, tone = "mint" }: { value: number; tone?: "mint" | "gold" | "red" }) {
  const width = Math.max(0, Math.min(100, value));
  return <span className={`story-meter story-meter--${tone}`}><i style={{ width: `${width}%` }} /></span>;
}
