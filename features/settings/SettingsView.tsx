"use client";

import { Modal } from "@/components/ui/Modal";
import { useMindWeather } from "@/hooks/useMindWeather";
import type { ReadingMode, SupportMode, ThemeId, ViewId } from "@/lib/types";
import type { AuthAccount } from "@/services/authService";
import { authService } from "@/services/authService";
import { disableGoogleAutoSelect } from "@/services/googleIdentityService";
import { Accessibility, BatteryLow, Bell, BookOpenText, BrainCircuit, Check, Cloud, Database, Download, Eye, Flame, KeyRound, Laptop, Leaf, LockKeyhole, LogOut, Moon, Palette, RotateCcw, ShieldCheck, Sparkles, Sun, Trash2, UserRound, Waves } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const tabs = [{ id: "account", label: "Account", icon: UserRound }, { id: "appearance", label: "Appearance", icon: Palette }, { id: "support", label: "Study support", icon: BrainCircuit }, { id: "accessibility", label: "Accessibility", icon: Accessibility }, { id: "notifications", label: "Notifications", icon: Bell }, { id: "privacy", label: "Privacy", icon: ShieldCheck }, { id: "data", label: "Data", icon: Database }];

const themes: { id: ThemeId; label: string; icon: typeof Cloud }[] = [
  { id: "atmospheric", label: "Atmospheric", icon: Cloud },
  { id: "midnight", label: "Midnight", icon: Moon },
  { id: "cloudlight", label: "Cloudlight", icon: Sun },
  { id: "aurora", label: "Aurora", icon: Sparkles },
  { id: "ocean", label: "Deep Ocean", icon: Waves },
  { id: "meadow", label: "Quiet Meadow", icon: Leaf },
  { id: "ember", label: "Warm Ember", icon: Flame },
  { id: "contrast", label: "High Contrast", icon: Eye },
];

const supportModes: { id: SupportMode; label: string; detail: string; icon: typeof BrainCircuit }[] = [
  { id: "flexible", label: "Flexible", detail: "Balanced pacing that follows today’s weather.", icon: Sparkles },
  { id: "adhd", label: "ADHD launchpad", detail: "Visible starts, shorter sprints, and fewer task switches.", icon: BrainCircuit },
  { id: "anxiety", label: "Anxiety-aware", detail: "Previewed steps, softer pressure, and clear pause points.", icon: ShieldCheck },
  { id: "low-energy", label: "Low-energy", detail: "Minimum useful plans with restorative breaks.", icon: BatteryLow },
  { id: "trauma-aware", label: "Choice-led", detail: "Predictable steps with control, choice, and safe exits.", icon: UserRound },
  { id: "sensory", label: "Sensory calm", detail: "Fewer transitions and a quieter working sequence.", icon: Waves },
  { id: "reading", label: "Reading support", detail: "Chunked directions with one action in each step.", icon: BookOpenText },
];

const readingModes: { id: ReadingMode; label: string; detail: string; sample: string }[] = [
  { id: "standard", label: "Standard", detail: "The original MindWeather typography and spacing.", sample: "Ideas can arrive in their own time." },
  { id: "open-letter", label: "Open-letter", detail: "Rounded shapes, wider word spacing, and a calmer reading rhythm.", sample: "One clear line at a time." },
  { id: "hyperlegible", label: "Hyperlegible", detail: "Distinct letter shapes, strong weight, and generous line spacing.", sample: "Keep every letter easy to find." },
];

export function SettingsView({}: { navigate?(view: ViewId): void }) {
  const router = useRouter();
  const { state, updatePreferences, updateProfile, downloadData, resetDemo, deleteData } = useMindWeather();
  const [tab, setTab] = useState("account");
  const [confirm, setConfirm] = useState<"delete" | "reset" | null>(null);
  const [account, setAccount] = useState<AuthAccount | null>(null);
  useEffect(() => {
    let active = true;
    void authService.current().then((current) => {
      if (active) setAccount(current);
    });
    return () => { active = false; };
  }, []);
  const signOut = async () => {
    await authService.logout();
    disableGoogleAutoSelect();
    setAccount(null);
    router.push("/");
  };
  return <div className="settings-page"><header className="view-heading"><span className="view-heading__eyebrow">Settings & privacy</span><h1>Make the station yours.</h1><p>Every recommendation is built from the information visible here.</p></header><div className="settings-layout"><aside className="settings-nav panel">{tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} className={tab === id ? "active" : ""}><Icon />{label}</button>)}</aside><section className="settings-content panel">
      {tab === "account" && <SettingsSection title="Account & sync" detail="Supabase verifies your account and keeps each learner's records separate."><div className="profile-edit"><span className="profile-edit__avatar">{state.profile.initials}</span><label className="form-field"><span>Name</span><input className="input" value={state.profile.name} onChange={(event) => updateProfile({ name: event.target.value, initials: event.target.value.split(" ").map((part) => part[0]).join("").slice(0,2).toUpperCase() })} /></label><label className="form-field"><span>Study field</span><input className="input" value={state.profile.field} onChange={(event) => updateProfile({ field: event.target.value })} /></label><label className="form-field"><span>Account email</span><input className="input" type="email" value={account?.email ?? state.profile.email} readOnly /></label></div>{account ? <SettingRow icon={account.providers.includes("google") ? ShieldCheck : KeyRound} title={`Signed in as ${account.email}`} detail={`Using ${account.providers.map((provider) => provider === "google" ? "Google" : "a secure password").join(" and ")}. Signing out does not delete your protected data.`}><button className="button button--ghost button--small" onClick={() => void signOut()}><LogOut /> Sign out</button></SettingRow> : <SettingRow icon={KeyRound} title="Sign in securely" detail="Use Google or create an email-and-password account."><Link href="/login" className="button button--ghost button--small">Sign in</Link></SettingRow>}</SettingsSection>}
      {tab === "appearance" && <SettingsSection title="Atmosphere" detail="Change the station’s lighting without changing its information."><div className="theme-grid">{themes.map(({ id, label, icon: Icon }) => <button key={id} aria-pressed={state.preferences.theme === id} className={state.preferences.theme === id ? `theme-swatch theme-swatch--${id} active` : `theme-swatch theme-swatch--${id}`} onClick={() => updatePreferences({ theme: id })}><span><Icon /></span><strong>{label}</strong>{state.preferences.theme === id && <Check />}</button>)}</div></SettingsSection>}
      {tab === "support" && <SettingsSection title="Study support lens" detail="Choose the kind of scaffolding that feels useful today. This is a preference, not a diagnosis."><div className="support-mode-grid">{supportModes.map(({ id, label, detail, icon: Icon }) => <button key={id} aria-pressed={state.preferences.supportMode === id} className={state.preferences.supportMode === id ? "support-mode active" : "support-mode"} onClick={() => updatePreferences({ supportMode: id })}><span><Icon /></span><div><strong>{label}</strong><small>{detail}</small></div>{state.preferences.supportMode === id && <Check />}</button>)}</div><p className="support-mode-note"><ShieldCheck /> Your selection stays on this device and only changes pacing, wording, and break structure.</p></SettingsSection>}
      {tab === "accessibility" && <SettingsSection title="Accessibility" detail="Readable, calm, and operable is the baseline."><div className="reading-mode-picker"><header><BookOpenText /><span><strong>Reading style</strong><small>Two dyslexia-friendly choices are included alongside the standard view.</small></span></header><div>{readingModes.map((mode) => <button key={mode.id} aria-pressed={state.preferences.readingMode === mode.id} className={`reading-mode reading-mode--${mode.id} ${state.preferences.readingMode === mode.id ? "active" : ""}`} onClick={() => updatePreferences({ readingMode: mode.id })}><span><strong>{mode.label}</strong><small>{mode.detail}</small><em>{mode.sample}</em></span>{state.preferences.readingMode === mode.id && <Check />}</button>)}</div></div><ToggleRow icon={Moon} title="Reduce motion" detail="Turns off weather drift, transitions, and celebratory motion." value={state.preferences.reduceMotion} onChange={(value) => updatePreferences({ reduceMotion: value })} /><ToggleRow icon={Eye} title="Increase contrast" detail="Strengthens borders, text, and status differentiation." value={state.preferences.highContrast} onChange={(value) => updatePreferences({ highContrast: value })} /><ToggleRow icon={Accessibility} title="Larger text" detail="Increases body and control text without breaking layout." value={state.preferences.largeText} onChange={(value) => updatePreferences({ largeText: value })} /><SettingRow icon={Laptop} title="Keyboard navigation" detail="All core flows support visible focus and keyboard operation."><span className="pill">Always on</span></SettingRow></SettingsSection>}
      {tab === "notifications" && <SettingsSection title="Notifications" detail="Compassionate signals only. Nothing that scolds."><ToggleRow icon={Bell} title="Helpful reminders" detail="Deadline nudges, resurfaced notes, and useful patterns." value={state.preferences.notifications} onChange={(value) => updatePreferences({ notifications: value })} /><ToggleRow icon={RotateCcw} title="Optional streaks" detail="Streaks are hidden by default and never affect progress." value={state.preferences.streaks} onChange={(value) => updatePreferences({ streaks: value })} /><div className="notification-example"><span>EXAMPLE</span><p>“Your calculus deadline is getting closer. Want help shrinking the next step?”</p></div></SettingsSection>}
      {tab === "privacy" && <SettingsSection title="Privacy centre" detail="Clear answers about what the station knows."><div className="privacy-list"><article><span><Database /></span><div><strong>What is stored</strong><p>Your account profile, study workspace, and notebook pages are stored in Supabase. Uploaded file copies stay in this browser on this device.</p></div></article><article><span><Eye /></span><div><strong>What shapes recommendations</strong><p>Self-reported weather, completion history, timing, session ratings, deadlines, and learning preferences.</p></div></article><article><span><LockKeyhole /></span><div><strong>What stays private</strong><p>Row Level Security only allows your signed-in user ID to read or change your records. Notebook file copies are not uploaded by this feature.</p></div></article></div><div className="privacy-promise"><ShieldCheck /><span><strong>Your study behaviour is not a product.</strong><small>MindWeather never sells your study history or gives another learner access to it.</small></span></div></SettingsSection>}
      {tab === "data" && <SettingsSection title="Your data" detail="Portable when you want it. Removable when you don’t."><SettingRow icon={Download} title="Download my data" detail="Export your MindWeather workspace as readable JSON."><button className="button button--ghost button--small" onClick={downloadData}>Download</button></SettingRow><SettingRow icon={RotateCcw} title="Reset my workspace" detail="Clear study records and start again with your own empty workspace."><button className="button button--ghost button--small" onClick={() => setConfirm("reset")}>Reset</button></SettingRow><SettingRow icon={Trash2} title="Delete my study data" detail="Remove tasks, history, notes, mistakes, and preferences from your workspace."><button className="button button--danger button--small" onClick={() => setConfirm("delete")}>Delete</button></SettingRow></SettingsSection>}
    </section></div><Modal open={!!confirm} onClose={() => setConfirm(null)} title={confirm === "delete" ? "Delete study data?" : "Reset your workspace?"} eyebrow="A deliberate choice"><div className="confirm-action"><p>{confirm === "delete" ? "This clears your current MindWeather workspace, its protected cloud copy, and notebook file copies held in this browser. Download a copy first if you may want it later." : "This replaces your current records with a clean workspace under the same account and removes notebook file copies from this browser."}</p><div><button className="button button--ghost" onClick={() => setConfirm(null)}>Keep things as they are</button><button className={confirm === "delete" ? "button button--danger" : "button button--peach"} onClick={() => { if (confirm === "delete") deleteData(); else resetDemo(); setConfirm(null); }}>{confirm === "delete" ? <Trash2 /> : <RotateCcw />}{confirm === "delete" ? "Delete study data" : "Reset workspace"}</button></div></div></Modal></div>;
}

function SettingsSection({ title, detail, children }: { title: string; detail: string; children: React.ReactNode }) { return <div className="settings-section"><header><h2>{title}</h2><p>{detail}</p></header>{children}</div>; }
function SettingRow({ icon: Icon, title, detail, children }: { icon: typeof UserRound; title: string; detail: string; children: React.ReactNode }) { return <div className="setting-row"><span><Icon /></span><div><strong>{title}</strong><small>{detail}</small></div>{children}</div>; }
function ToggleRow({ icon, title, detail, value, onChange }: { icon: typeof UserRound; title: string; detail: string; value: boolean; onChange(value: boolean): void }) { return <SettingRow icon={icon} title={title} detail={detail}><button role="switch" aria-checked={value} onClick={() => onChange(!value)} className={value ? "switch active" : "switch"}><i /></button></SettingRow>; }
