import Image from "next/image";
import { useQuestling } from "../core/QuestlingProvider";
import { Tabs } from "../core/primitives";
import { AVATAR_ART, QuestlingArt, QuestlingArtCard } from "../art/QuestlingArt";

export function SourceLibraryScreen() {
  const { sources, setUploadedName, uploadPdf, navigate } = useQuestling();
  return (
    <div className="library-layout">
      <div className="library-intro">
        <p>♧ Your trusted sources for grounded learning.</p>
        <label className="story-button story-button--primary compact-upload">⇧ Add Material
          <input aria-label="Add source PDF" type="file" accept="application/pdf,.pdf" onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void uploadPdf(file);
            event.currentTarget.value = "";
          }} />
        </label>
      </div>
      <div className="story-panel source-table">
        <div className="source-row source-row--head"><span>Source</span><span>Status</span><span>Pages</span><span>Last studied</span><span /></div>
        {sources.map((source, index) => (
          <button className="source-row" key={source} onClick={() => { setUploadedName(source); navigate("source-details"); }}>
            <span><b className="file-icon">{source.endsWith("docx") ? "DOCX" : "PDF"}</b>{source}</span>
            <span><i>✓ Ready</i></span><span>{24 - index * 4}</span><span>{index === 0 ? "Today, 8:42 PM" : `${index + 1} days ago`}</span><span>›</span>
          </button>
        ))}
      </div>
      <button className="story-button" onClick={() => navigate("source-attention")}>▤ Manage Uploads</button>
      <button className="story-button story-button--primary" onClick={() => navigate("first-steps")}>Enter Active Realm</button>
    </div>
  );
}

export function SourceDetailsScreen() {
  const { uploadedName, pack, setMasteryTopic, setNotice, setProcessingStep, setConfirmAction, navigate } = useQuestling();
  const sourceName = uploadedName ?? pack.sourceName;
  return (
    <div className="story-panel source-detail-layout">
      <div className="source-preview"><Image src="/assets/demo-notes-1.jpg" alt="Preview of source notes" width={573} height={1280} /></div>
      <div className="source-info">
        <h2>{sourceName}</h2><p>24 pages · Uploaded today</p>
        <div className="source-analysis">
          <div><h3>Topic Outline</h3>{pack.topics.map((topic) => <button key={topic} onClick={() => { setMasteryTopic(topic); navigate("mastery"); }}>♧ {topic}</button>)}</div>
          <div><h3>Processing Confidence</h3><span className="confidence-seal">♧</span><b>High</b></div>
        </div>
        <div className="grounding-preview"><h3>Grounding Preview</h3><p>✓ All questions will be grounded in this source. Cited excerpts come directly from these pages.</p></div>
        <div className="button-row wrap">
          <button className="story-button" onClick={() => setNotice("Source activated for new questions")}>✦ Use for Questions</button>
          <button className="story-button" onClick={() => { setProcessingStep(3); setNotice("Source reprocessed successfully"); }}>⚙ Reprocess</button>
          <button className="story-button story-button--danger" onClick={() => setConfirmAction(`delete-source:${sourceName}`)}>♲ Delete</button>
          <button className="story-button story-button--primary" onClick={() => navigate("first-steps")}>✦ Enter Realm</button>
        </div>
      </div>
    </div>
  );
}

export function WardrobeScreen() {
  const { wardrobeTab, setWardrobeTab, wardrobeChoice, setWardrobeChoice, setNotice } = useQuestling();
  const options = ["Archive blue", "Verdant green", "Scholar ivory", "Night violet"];
  const selectedAvatar = AVATAR_ART[wardrobeChoice % AVATAR_ART.length];
  return (
    <div className="split-layout">
      <div className="avatar-showcase"><QuestlingArt id={selectedAvatar.id} crop="full" priority /><div><p className="eyebrow">WARDROBE PREVIEW</p><h2>{selectedAvatar.name}</h2><span>{options[wardrobeChoice]}</span></div></div>
      <div className="story-panel wardrobe-panel">
        <Tabs items={["Outfits", "Hair", "Accessories", "Colors"]} active={wardrobeTab} onChange={setWardrobeTab} label="Wardrobe categories" />
        {wardrobeTab === "Outfits" ? <div className="avatar-art-grid">{AVATAR_ART.map((avatar, index) => <QuestlingArtCard key={avatar.id} id={avatar.id} crop="portrait" selected={wardrobeChoice === index} onClick={() => setWardrobeChoice(index)} />)}</div> : <div className="wardrobe-grid">{options.map((option, index) => <button className={wardrobeChoice === index ? "active" : ""} key={option} disabled={index === 3} onClick={() => setWardrobeChoice(index)}><span>{wardrobeTab === "Hair" ? "♟" : wardrobeTab === "Accessories" ? "✦" : "◉"}</span><b>{option}</b><i>{index === 3 ? "Locked" : "Available"}</i></button>)}</div>}
        <p>Previewing: <strong>{options[wardrobeChoice]}</strong></p>
        <div className="button-row"><button className="story-button" disabled={wardrobeTab !== "Outfits" && wardrobeChoice === 3} onClick={() => setNotice(`${options[wardrobeChoice]} equipped`)}>♧ Equip</button><button className="story-button story-button--primary" onClick={() => setNotice("Avatar look saved")}>✦ Save Look</button></div>
      </div>
    </div>
  );
}

export function InventoryScreen() {
  const { inventoryTab, setInventoryTab, selectedItem, setSelectedItem, setNotice } = useQuestling();
  const items = inventoryTab === "Relics" ? ["Archive Key", "Moon Compass", "Verdant Leaf", "Ancient Tablet"] : inventoryTab === "Quest" ? ["Sealed Letter", "Archive Map", "Warden Sigil"] : inventoryTab === "Gifts" ? ["Lumi Plush", "Moon Treat", "Silver Bell"] : ["Focus Crystal", "Spring Water", "Moss Thread"];
  function changeTab(tab: string) {
    setInventoryTab(tab);
    setSelectedItem(tab === "Relics" ? "Archive Key" : tab === "Quest" ? "Sealed Letter" : tab === "Gifts" ? "Lumi Plush" : "Focus Crystal");
  }
  return (
    <div className="inventory-layout">
      <div className="story-panel inventory-grid">
        <Tabs items={["Quest", "Relics", "Gifts", "Materials"]} active={inventoryTab} onChange={changeTab} label="Inventory categories" />
        <div className="item-grid">{items.map((item, index) => <button className={selectedItem === item ? "active" : ""} key={item} onClick={() => setSelectedItem(item)}><span>{index === 0 ? "⚿" : index === 1 ? "◉" : index === 2 ? "♧" : "▤"}</span><b>{item}</b></button>)}</div>
      </div>
      <div className="story-panel item-detail"><span className="item-hero">{selectedItem.includes("Key") ? "⚿" : selectedItem.includes("Lumi") ? "🦊" : "✦"}</span><h2>{selectedItem}</h2><p>{selectedItem === "Archive Key" ? "Opens sealed doors in the Forgotten Archive." : "A useful reward collected during your study journey."}</p><button className="story-button story-button--primary" onClick={() => setNotice(`${selectedItem} used successfully`)}>✦ Use</button></div>
    </div>
  );
}

export function SourceAttentionScreen() {
  const { sourceReviewed, setSourceReviewed, setNotice, setConfirmAction } = useQuestling();
  return (
    <div className="story-panel attention-card">
      <div className="attention-heading"><span>△</span><div><h2>Scanned Biology Notes.pdf</h2><h3>{sourceReviewed ? "All pages reviewed" : "6 pages need review"}</h3><p>Some content is unclear or low confidence. Review it before questions are generated.</p></div></div>
      <div className="page-thumbnails">{[7, 8, 9, 10, 11, 12].map((page) => <button key={page} className={sourceReviewed ? "reviewed" : ""} onClick={() => setNotice(`Page ${page} opened for review`)}><Image src={page % 2 ? "/assets/demo-notes-1.jpg" : "/assets/demo-notes-2.jpg"} alt={`Notes page ${page}`} width={573} height={1280} /><span>{sourceReviewed ? "✓" : page}</span></button>)}</div>
      <div className="button-row"><button className="story-button" onClick={() => { setSourceReviewed(true); setNotice("Low-confidence pages marked reviewed"); }}>◉ Review Pages</button><button className="story-button" onClick={() => setNotice("OCR retry complete: confidence improved")}>↻ Retry OCR</button><button className="story-button story-button--danger" onClick={() => setConfirmAction("remove-source:Biology Notes.pdf")}>♲ Remove Source</button></div>
      <small>♢ No questions will be created from unreadable pages.</small>
    </div>
  );
}
