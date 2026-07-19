import { useQuestling } from "../core/QuestlingProvider";
import { Tabs } from "../core/primitives";

export function SettingsScreen() {
  const { settingsTab, setSettingsTab, settings, setSettings, setNotice, navigate } = useQuestling();
  return (
    <div className="settings-layout">
      <div className="story-panel settings-card">
        <Tabs items={["Accessibility", "Controls", "Audio", "Privacy"]} active={settingsTab} onChange={setSettingsTab} label="Settings categories" />
        {settingsTab === "Accessibility" && (
          <div className="setting-list">
            {[["Reduce motion", "motion"], ["Larger text", "largeText"], ["Dyslexia-friendly font", "dyslexia"], ["High contrast questions", "contrast"]].map(([label, key]) => (
              <label key={key}><span>{label}</span><input type="checkbox" checked={Boolean(settings[key as keyof typeof settings])} onChange={(event) => setSettings((value) => ({ ...value, [key]: event.target.checked }))} /><i /></label>
            ))}
          </div>
        )}
        {settingsTab === "Controls" && <div className="control-options">{["Mouse", "Keyboard", "Touch"].map((control) => <button className={settings.controls === control ? "active" : ""} key={control} onClick={() => setSettings((value) => ({ ...value, controls: control }))}>{control}</button>)}</div>}
        {settingsTab === "Audio" && <div className="slider-list"><label>Dialogue volume <input aria-label="Dialogue volume" type="range" min="0" max="100" value={settings.dialogue} onChange={(event) => setSettings((value) => ({ ...value, dialogue: Number(event.target.value) }))} /></label><label>Music volume <input aria-label="Music volume" type="range" min="0" max="100" value={settings.music} onChange={(event) => setSettings((value) => ({ ...value, music: Number(event.target.value) }))} /></label></div>}
        {settingsTab === "Privacy" && <div className="privacy-copy"><h2>Your sources stay yours.</h2><p>Uploaded materials are used to build grounded questions. Delete controls are always available in Account & Privacy.</p><button className="story-button" onClick={() => navigate("account")}>Open Account & Privacy</button></div>}
        <button className="story-button story-button--primary" onClick={() => { window.localStorage.setItem("questling-settings", JSON.stringify(settings)); setNotice("Settings saved"); }}>✦ Save Settings</button>
      </div>
    </div>
  );
}

export function AccountScreen() {
  const { accountTab, setAccountTab, sources, setConfirmAction, setNotice, navigate } = useQuestling();
  function exportLearningData() {
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), sources, prototype: true }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "questling-learning-data.json";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Learning data downloaded");
  }
  const actions = accountTab === "Profile"
    ? [["Export Learning Data", "Download your questions, answers, and progress."], ["Edit Profile", "Update your display name and avatar."]]
    : accountTab === "Data"
      ? [["Export Learning Data", "Download your learning history."], ["Clear Local Progress", "Reset this browser's prototype progress."]]
      : accountTab === "Uploads"
        ? [["Manage Uploaded Materials", `${sources.length} sources · 58 pages`], ["Delete Uploaded Materials", "Remove all uploaded sources and related data."]]
        : [["Parental Controls", "Safety and content preferences."], ["Learning Summary", "View a learner-safe progress overview."]];
  return (
    <div className="account-layout">
      <div className="story-panel account-tabs">
        {["Profile", "Data", "Uploads", "Parental Controls"].map((tab) => <button className={accountTab === tab ? "active" : ""} key={tab} onClick={() => setAccountTab(tab)}><span>{tab === "Profile" ? "◎" : tab === "Data" ? "▣" : tab === "Uploads" ? "⇧" : "♟"}</span><b>{tab}</b></button>)}
      </div>
      <div className="story-panel account-card">
        <div className="profile-line"><span>◎</span><div><h2>Lumi</h2><p>lumi@questling.app</p><small>Member since May 12, 2025</small></div></div>
        {actions.map(([title, body], index) => (
          <button className="account-action" key={title} onClick={() => {
            if (title === "Clear Local Progress") setConfirmAction("clear-local-progress");
            else if (title === "Delete Uploaded Materials") setConfirmAction("delete-uploaded-materials");
            else if (title.includes("Manage")) navigate("source-library");
            else if (title.includes("Edit Profile")) navigate("wardrobe");
            else if (title.includes("Export")) exportLearningData();
            else setNotice(`${title} complete`);
          }}><b>{title}</b><span>{body}</span><i>{index === 0 ? "›" : ""}</i></button>
        ))}
        <button className="account-action danger" onClick={() => setConfirmAction("delete-account")}><b>Delete Account</b><span>Permanently delete your account and all data.</span></button>
      </div>
    </div>
  );
}
