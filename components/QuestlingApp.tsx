"use client";

import { useEffect, useRef } from "react";
import { SCREEN_IDS } from "./questling/core/config";
import { QuestlingProvider, useQuestling } from "./questling/core/QuestlingProvider";
import { Rune, SceneFrame } from "./questling/core/primitives";
import { ScreenRouter, sceneForScreen } from "./questling/screens/ScreenRouter";

export { SCREEN_IDS };

function QuestlingExperience() {
  const {
    screen,
    notice,
    settings,
    openPause,
    navigate,
    confirmAction,
    setConfirmAction,
    setSources,
    setNotice,
  } = useQuestling();

  function confirmPendingAction() {
    if (!confirmAction) return;
    if (confirmAction.startsWith("delete-source:") || confirmAction.startsWith("remove-source:")) {
      const target = confirmAction.slice(confirmAction.indexOf(":") + 1);
      setSources((items) => items.filter((source) => source !== target));
    }
    if (confirmAction === "delete-uploaded-materials") {
      setSources([]);
    }
    if (confirmAction === "clear-local-progress") {
      window.localStorage.clear();
    }
    if (confirmAction === "delete-account") {
      window.localStorage.clear();
      setSources([]);
      navigate("title");
    }
    const actionLabel = confirmAction.split(":", 1)[0].replaceAll("-", " ");
    setNotice(`${actionLabel} completed`);
    setConfirmAction(null);
  }

  const shellClass = [
    "app-shell",
    settings.largeText && "large-text",
    settings.dyslexia && "dyslexia-text",
    settings.motion && "reduce-motion",
    settings.contrast && "high-contrast",
  ].filter(Boolean).join(" ");

  return (
    <main className={shellClass}>
      <SceneFrame
        screen={screen}
        scene={sceneForScreen(screen)}
        onHome={() => navigate("first-steps")}
        onPause={openPause}
        status={notice}
      >
        <ScreenRouter />
      </SceneFrame>
      {confirmAction && <ConfirmationModal action={confirmAction} onCancel={() => setConfirmAction(null)} onConfirm={confirmPendingAction} />}
    </main>
  );
}

function ConfirmationModal({ action, onCancel, onConfirm }: { action: string; onCancel: () => void; onConfirm: () => void }) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      returnFocusRef.current?.focus();
    };
  }, [onCancel]);

  return (
    <div className="modal-backdrop" role="presentation">
      <div ref={dialogRef} className="story-panel confirm-modal" role="dialog" aria-modal="true" aria-label="Confirm action">
        <Rune /><h2>Confirm this action?</h2>
        <p>{action.split(":", 1)[0].replaceAll("-", " ")} affects this local prototype. You can cancel safely.</p>
        <div className="button-row">
          <button ref={cancelRef} className="story-button" onClick={onCancel}>Cancel</button>
          <button className="story-button story-button--danger" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

export default function QuestlingApp() {
  return (
    <QuestlingProvider>
      <QuestlingExperience />
    </QuestlingProvider>
  );
}
