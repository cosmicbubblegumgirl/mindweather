"use client";

import { Bloop } from "@/components/brand/Bloop";
import { useMindWeather } from "@/hooks/useMindWeather";
import type { ViewId } from "@/lib/types";
import { roomService, type RoomPresence } from "@/services/roomService";
import { BookOpen, Coffee, DoorOpen, EyeOff, Hammer, MessageCircleOff, Radio, Sparkles, Users, Waves } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const demoMembers: RoomPresence[] = [
  { id: "m1", name: "Nia", status: "Reading", updatedAt: new Date().toISOString() }, { id: "m2", name: "Kai", status: "Building", updatedAt: new Date().toISOString() }, { id: "m3", name: "Ari", status: "Revising", updatedAt: new Date().toISOString() }, { id: "m4", name: "Mo", status: "Studying", updatedAt: new Date().toISOString() }, { id: "m5", name: "Eli", status: "Taking a break", updatedAt: new Date().toISOString() },
];

export function RoomsView({}: { navigate?(view: ViewId): void }) {
  const { state } = useMindWeather();
  const [joined, setJoined] = useState(false);
  const [status, setStatus] = useState("Studying");
  const [members, setMembers] = useState(demoMembers);
  const [reaction, setReaction] = useState("");
  const channelRef = useRef<BroadcastChannel | null>(null);
  useEffect(() => { const channel = roomService.channel(); channelRef.current = channel; if (!channel) return; channel.onmessage = (event) => { const payload = event.data as { type: string; member: RoomPresence }; if (payload.type === "presence") setMembers((items) => [...items.filter((item) => item.id !== payload.member.id), payload.member]); }; return () => { channel.close(); channelRef.current = null; }; }, []);
  const announce = (nextStatus = status, nextReaction = "") => { const member = { id: state.profile.id, name: state.profile.name, status: nextStatus, reaction: nextReaction, updatedAt: new Date().toISOString() }; roomService.announce(channelRef.current, member); setMembers((items) => [...items.filter((item) => item.id !== member.id), member]); };
  return <div className="rooms-page">
    <header className="view-heading view-heading--row"><div><span className="view-heading__eyebrow">Body Double Rooms</span><h1>Quiet company, no performance.</h1><p>No camera. No microphone. No follower counts. Just the gentle signal that other people are here too.</p></div><span className="privacy-pill"><EyeOff /> Privacy-first presence</span></header>
    {!joined ? <div className="room-lobby"><section className="room-feature panel"><div className="room-orbit"><span className="avatar-blob avatar-blob--you"><Bloop mood="neutral" size="sm" /></span>{demoMembers.slice(0,4).map((member, index) => <span className={`avatar-blob avatar-blob--${index}`} key={member.id}><i />{member.name}</span>)}</div><div><span><Radio /> LIVE QUIET ROOM</span><h2>Quiet Orbit</h2><p>12 people studying. Sound off. Cameras never requested.</p><div className="room-statuses"><span><BookOpen /> 5 reading</span><span><Hammer /> 3 building</span><span><Sparkles /> 4 revising</span></div><button className="button button--peach" onClick={() => { setJoined(true); announce(); }}>Enter Quiet Orbit <DoorOpen /></button></div></section><aside className="room-rules panel"><MessageCircleOff /><h3>Less social, more together.</h3><ul><li>No public profiles</li><li>No private messaging</li><li>No attention metrics</li><li>Reactions disappear quickly</li></ul><p>Presence runs between open local sessions using browser channels. A hosted version can swap in Supabase Realtime.</p></aside></div> : <section className="active-room panel"><header><div><span className="status-dot" /><span><small>QUIET ORBIT</small><strong>{members.length + 7} studying</strong></span></div><label>I’m<select value={status} onChange={(event) => { setStatus(event.target.value); announce(event.target.value); }}>{["Studying", "Reading", "Building", "Revising", "Taking a break"].map((item) => <option key={item}>{item}</option>)}</select></label><button className="button button--ghost button--small" onClick={() => setJoined(false)}>Leave quietly</button></header><div className="room-sky">{members.map((member, index) => <div className={`room-member member--${index % 7}`} key={member.id}><span className="room-blob"><i /><i /></span><strong>{member.name}</strong><small>{member.status}</small>{member.reaction && <em>{member.reaction}</em>}</div>)}<div className="quiet-message"><Bloop mood="encouraging" size="sm" /><span>No need to say anything.<br />Your presence is enough.</span></div></div><footer><span>Send a tiny signal</span>{[{ icon: Waves, label: "wave", glyph: "~" },{ icon: Sparkles, label: "sparkle", glyph: "✦" },{ icon: Coffee, label: "coffee", glyph: "☕" },{ icon: Users, label: "you got this", glyph: "♡" }].map(({ icon: Icon, label, glyph }) => <button key={label} className={reaction === label ? "active" : ""} onClick={() => { setReaction(label); announce(status, glyph); window.setTimeout(() => setReaction(""), 2500); }}><Icon />{label}</button>)}</footer></section>}
  </div>;
}
