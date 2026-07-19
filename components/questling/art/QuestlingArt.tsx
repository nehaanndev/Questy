import Image from "next/image";
import type { CSSProperties, MouseEventHandler, ReactNode } from "react";
import { getQuestlingArt, type QuestlingArtId } from "./catalog";
import styles from "./QuestlingArt.module.css";

type ArtCrop = "portrait" | "full" | "battle";

export type QuestlingArtProps = {
  id: QuestlingArtId;
  crop?: ArtCrop;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

/**
 * Responsive artwork primitive. Generated images stay decorative while all
 * names, meters, buttons, and selection states remain accessible live UI.
 */
export function QuestlingArt({
  id,
  crop = "portrait",
  className = "",
  priority = false,
  sizes = "(max-width: 700px) 42vw, 280px",
}: QuestlingArtProps) {
  const art = getQuestlingArt(id);
  return (
    <figure
      className={`${styles.art} ${styles[crop]} ${styles[art.accent]} ${className}`}
      data-art-id={id}
    >
      <Image
        src={art.src}
        alt={art.alt}
        fill
        priority={priority}
        sizes={sizes}
        className={styles.image}
      />
      <span className={styles.vignette} aria-hidden="true" />
    </figure>
  );
}

export type QuestlingArtCardProps = QuestlingArtProps & {
  cardClassName?: string;
  selected?: boolean;
  disabled?: boolean;
  badge?: string;
  meta?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  style?: CSSProperties;
};

/** Selectable card for avatar choices, codex grids, and team builders. */
export function QuestlingArtCard({
  id,
  cardClassName = "",
  selected = false,
  disabled = false,
  badge,
  meta,
  onClick,
  style,
  ...artProps
}: QuestlingArtCardProps) {
  const art = getQuestlingArt(id);
  return (
    <button
      type="button"
      className={`${styles.card} ${cardClassName}`}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      style={style}
      data-selected={selected || undefined}
    >
      {badge ? <span className={styles.badge}>{badge}</span> : null}
      <QuestlingArt id={id} {...artProps} />
      <span className={styles.copy}>
        <strong>{art.name}</strong>
        <small>{art.role}</small>
        {meta ? <span className={styles.meta}>{meta}</span> : null}
      </span>
      <span className={styles.selection} aria-hidden="true">{selected ? "✓" : "✦"}</span>
    </button>
  );
}

export { AVATAR_ART, CREATURE_ART, QUESTLING_ART } from "./catalog";
export type { QuestlingArtEntry, QuestlingArtId } from "./catalog";
