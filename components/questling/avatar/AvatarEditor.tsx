"use client";

import Image from "next/image";
import { useQuestling } from "../core/QuestlingProvider";
import styles from "./AvatarEditor.module.css";

const CAREERS = [
  { id: "pathfinder", name: "Pathfinder", role: "Curious Explorer", src: "/assets/characters/pathfinder-avatar-cutout.png" },
  { id: "archiveMage", name: "Archive Mage", role: "Insight Weaver", src: "/assets/characters/archive-mage-avatar-cutout.png" },
  { id: "guardian", name: "Guardian", role: "Steadfast Protector", src: "/assets/characters/guardian-avatar-cutout.png" },
] as const;

/** Career selection keeps the detailed avatar art visible without extra setup screens. */
export function AvatarEditor() {
  const { avatarChoice, setAvatarChoice, navigate } = useQuestling();
  const selectedCareer = CAREERS[avatarChoice % CAREERS.length];

  return (
    <div className={styles.layout}>
      <section className={styles.preview} aria-label="Selected career avatar preview">
        <figure className={styles.avatar} data-testid="avatar-editor-preview" data-career={selectedCareer.id}>
          <Image
            src={selectedCareer.src}
            alt={`${selectedCareer.name} avatar preview`}
            fill
            loading="eager"
            sizes="(max-width: 900px) 94vw, 62vw"
            className={styles.avatarImage}
          />
        </figure>
      </section>

      <section className={`story-panel avatar-panel ${styles.panel}`} aria-label="Career selection">
        <div className={styles.careerTab}>Career</div>
        <h2>Choose your career</h2>
        <p className={styles.intro}>Choose the role that will guide your study journey.</p>
        <div className={styles.careerGrid} role="group" aria-label="Choose a career">
          {CAREERS.map((career, index) => (
            <button
              key={career.id}
              type="button"
              className={avatarChoice === index ? styles.selectedCareer : ""}
              aria-pressed={avatarChoice === index}
              onClick={() => setAvatarChoice(index)}
            >
              <span className={styles.careerPortrait}>
                <Image src={career.src} alt="" fill loading="eager" sizes="180px" />
              </span>
              <strong>{career.name}</strong>
              <small>{career.role}</small>
            </button>
          ))}
        </div>
        <div className={styles.panelFooter}>
          <p>Selected career: <strong>{selectedCareer.name}</strong></p>
          <button className="story-button story-button--primary" onClick={() => navigate("world-builder")}>Save &amp; Continue</button>
        </div>
      </section>
    </div>
  );
}
