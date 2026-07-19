"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { useQuestling } from "../core/QuestlingProvider";
import { Tabs } from "../core/primitives";
import styles from "./AvatarEditor.module.css";

const PATHS = [
  { id: "pathfinder", name: "Pathfinder", role: "Curious Explorer", src: "/assets/characters/pathfinder-avatar-cutout.png" },
  { id: "archiveMage", name: "Archive Mage", role: "Insight Weaver", src: "/assets/characters/archive-mage-avatar-cutout.png" },
  { id: "guardian", name: "Guardian", role: "Steadfast Protector", src: "/assets/characters/guardian-avatar-cutout.png" },
] as const;

const FACE_OPTIONS = {
  "Skin color": [
    ["Porcelain", "#f1c6a5"], ["Warm", "#c98255"], ["Golden", "#ad653b"],
    ["Umber", "#75422e"], ["Deep", "#46251c"], ["Cool brown", "#94604c"],
  ],
  "Eye color": [
    ["Hazel", "#8b6a35"], ["Brown", "#4c2d20"], ["Green", "#4d8060"],
    ["Blue", "#4a7994"], ["Violet", "#765c91"],
  ],
  "Lip color": [
    ["Natural", "#a95f55"], ["Rose", "#b85f6c"], ["Berry", "#813d59"], ["Cocoa", "#754a42"],
  ],
  "Eye shape": [["Almond", ""], ["Round", ""], ["Upturned", ""], ["Hooded", ""]],
  "Nose shape": [["Soft", ""], ["Straight", ""], ["Button", ""], ["Broad", ""]],
  "Eyebrow shape": [["Natural", ""], ["Arched", ""], ["Straight", ""], ["Soft angle", ""]],
} as const;

type FaceSection = keyof typeof FACE_OPTIONS;
type AvatarStyle = CSSProperties & {
  "--skin-tone": string;
  "--eye-color": string;
  "--lip-color": string;
};

const SIMPLE_OPTIONS = {
  Hair: ["Tousled", "Braided", "Cropped", "Wavy", "Coils", "Long"],
  Outfit: ["Explorer", "Scholar", "Guardian", "Nightweave"],
  Gender: ["Woman", "Man", "Nonbinary", "Custom"],
} as const;

/**
 * Layered avatar editor. Color changes are confined to hand-authored masks,
 * so selecting a skin tone never recolors clothing, hair, or the backdrop.
 */
export function AvatarEditor() {
  const { avatarTab, setAvatarTab, avatarChoice, setAvatarChoice, navigate } = useQuestling();
  const [faceSection, setFaceSection] = useState<FaceSection>("Skin color");
  const [faceSelections, setFaceSelections] = useState<Record<FaceSection, number>>({
    "Skin color": 1,
    "Eye color": 0,
    "Lip color": 0,
    "Eye shape": 0,
    "Nose shape": 0,
    "Eyebrow shape": 0,
  });
  const [simpleSelections, setSimpleSelections] = useState<Record<string, number>>({ Hair: 0, Outfit: 0, Gender: 2 });
  const selectedPath = PATHS[avatarChoice % PATHS.length];
  const skinTone = FACE_OPTIONS["Skin color"][faceSelections["Skin color"]][1];
  const eyeColor = FACE_OPTIONS["Eye color"][faceSelections["Eye color"]][1];
  const lipColor = FACE_OPTIONS["Lip color"][faceSelections["Lip color"]][1];
  const avatarStyle = { "--skin-tone": skinTone, "--eye-color": eyeColor, "--lip-color": lipColor } as AvatarStyle;

  const selectedLabel = (() => {
    if (avatarTab === "Face") return FACE_OPTIONS[faceSection][faceSelections[faceSection]][0];
    if (avatarTab === "Path / Career") return selectedPath.name;
    return SIMPLE_OPTIONS[avatarTab as keyof typeof SIMPLE_OPTIONS]?.[simpleSelections[avatarTab] ?? 0] ?? "Selected";
  })();

  function chooseFace(index: number) {
    setFaceSelections((current) => ({ ...current, [faceSection]: index }));
  }

  return (
    <div className={styles.layout}>
      <section className={styles.preview} aria-label="Avatar preview">
        <figure
          className={`${styles.avatar} ${avatarTab === "Face" ? styles.faceZoom : ""}`}
          data-testid="avatar-editor-preview"
          data-path={selectedPath.id}
          data-skin-tone={faceSelections["Skin color"]}
          data-eye-color={faceSelections["Eye color"]}
          data-lip-color={faceSelections["Lip color"]}
          data-eye-shape={faceSelections["Eye shape"]}
          data-nose-shape={faceSelections["Nose shape"]}
          data-eyebrow-shape={faceSelections["Eyebrow shape"]}
          style={avatarStyle}
        >
          <Image src={selectedPath.src} alt={`${selectedPath.name} avatar preview`} fill loading="eager" sizes="(max-width: 900px) 94vw, 62vw" className={styles.avatarImage} />
          <span className={`${styles.colorLayer} ${styles.skinLayer}`} data-layer="skin" aria-hidden="true" />
          <span className={`${styles.colorLayer} ${styles.eyeLayer}`} data-layer="eyes" aria-hidden="true" />
          <span className={`${styles.colorLayer} ${styles.lipLayer}`} data-layer="lips" aria-hidden="true" />
        </figure>
        <div className={styles.previewHint} aria-live="polite">
          <span>{avatarTab === "Face" ? `${faceSection}: ${selectedLabel}` : selectedLabel}</span>
          <small>{avatarTab === "Face" ? "Shoulders-up detail view" : "Full character view"}</small>
        </div>
      </section>

      <section className={`story-panel avatar-panel ${styles.panel}`} aria-label="Avatar editor">
        <Tabs
          items={["Face", "Hair", "Outfit", "Path / Career", "Gender"]}
          active={avatarTab}
          onChange={setAvatarTab}
          label="Avatar editor sections"
        />

        {avatarTab === "Face" ? (
          <FaceControls section={faceSection} setSection={setFaceSection} selections={faceSelections} choose={chooseFace} />
        ) : avatarTab === "Path / Career" ? (
          <div className={styles.pathGrid} role="group" aria-label="Choose a path or career">
            {PATHS.map((path, index) => (
              <button key={path.id} type="button" className={avatarChoice === index ? styles.selectedPath : ""} aria-pressed={avatarChoice === index} onClick={() => setAvatarChoice(index)}>
                <span className={styles.pathPortrait}><Image src={path.src} alt="" fill sizes="150px" /></span>
                <strong>{path.name}</strong><small>{path.role}</small>
              </button>
            ))}
          </div>
        ) : (
          <OptionButtons
            options={SIMPLE_OPTIONS[avatarTab as keyof typeof SIMPLE_OPTIONS] ?? []}
            selected={simpleSelections[avatarTab] ?? 0}
            onChoose={(index) => setSimpleSelections((current) => ({ ...current, [avatarTab]: index }))}
          />
        )}

        <div className={styles.panelFooter}>
          <p>Selected {(avatarTab === "Face" ? faceSection : avatarTab).toLowerCase()}: <strong>{selectedLabel}</strong></p>
          <button className="story-button story-button--primary" onClick={() => navigate("world-builder")}>Save &amp; Continue</button>
        </div>
      </section>
    </div>
  );
}

function FaceControls({ section, setSection, selections, choose }: {
  section: FaceSection;
  setSection: (section: FaceSection) => void;
  selections: Record<FaceSection, number>;
  choose: (index: number) => void;
}) {
  const options = FACE_OPTIONS[section];
  const usesColor = section.includes("color");
  return (
    <div className={styles.faceControls}>
      <div className={styles.faceSections} role="group" aria-label="Face details">
        {(Object.keys(FACE_OPTIONS) as FaceSection[]).map((item) => (
          <button key={item} type="button" className={section === item ? styles.activeSection : ""} aria-pressed={section === item} onClick={() => setSection(item)}>{item}</button>
        ))}
      </div>
      <OptionButtons options={options.map(([label]) => label)} colors={usesColor ? options.map(([, color]) => color) : undefined} selected={selections[section]} onChoose={choose} />
    </div>
  );
}

function OptionButtons({ options, colors, selected, onChoose }: {
  options: readonly string[];
  colors?: readonly string[];
  selected: number;
  onChoose: (index: number) => void;
}) {
  return (
    <div className={styles.optionGrid} role="group" aria-label="Available choices">
      {options.map((option, index) => (
        <button key={option} type="button" className={selected === index ? styles.selectedOption : ""} aria-pressed={selected === index} onClick={() => onChoose(index)}>
          {colors?.[index] ? <i style={{ background: colors[index] }} aria-hidden="true" /> : <span aria-hidden="true">◇</span>}
          <b>{option}</b>
        </button>
      ))}
    </div>
  );
}
