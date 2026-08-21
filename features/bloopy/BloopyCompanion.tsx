"use client";

import { Bloop, type BloopMood } from "@/components/brand/Bloop";
import { useMindWeather } from "@/hooks/useMindWeather";
import { localBloopyReply } from "@/lib/bloopyKnowledge";
import type { ViewId } from "@/lib/types";
import { bloopyService, type BloopyMessage, type BloopySource } from "@/services/bloopyService";
import { ArrowRight, BookOpenCheck, Bot, Compass, ExternalLink, Globe2, LoaderCircle, MessageCircle, Minimize2, Navigation, Send, Sparkles, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

interface DisplayMessage extends BloopyMessage {
  id: string;
  sources?: BloopySource[];
  navigateTo?: ViewId;
  actionLabel?: string;
}

const starters = [
  { label: "What should I do now?", icon: Sparkles },
  { label: "Open my resources", icon: Compass },
  { label: "Make a timetable", icon: BookOpenCheck },
];

export function BloopyCompanion({ navigate }: { navigate(view: ViewId): void }) {
  const { state, plan } = useMindWeather();
  const [open, setOpen] = useState(false);
  const [online, setOnline] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([{ id: "hello", role: "assistant", content: `Hi ${state.profile.name || "there"}. I’m Bloopy. I know this whole little weather station. Where shall we wobble first?` }]);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: state.preferences.reduceMotion ? "auto" : "smooth" });
  }, [messages, open, state.preferences.reduceMotion]);

  const mood: BloopMood = busy ? "thinking" : messages.at(-1)?.role === "user" ? "thinking" : state.currentWeather === "battery" ? "sleepy" : state.currentWeather === "storm" ? "encouraging" : "happy";

  const send = async (raw: string) => {
    const content = raw.trim();
    if (!content || busy) return;
    const userMessage: DisplayMessage = { id: crypto.randomUUID(), role: "user", content };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    const local = localBloopyReply(content, state, plan);
    if (local) {
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content: local.text, navigateTo: local.navigateTo, actionLabel: local.actionLabel }]);
      return;
    }
    setBusy(true);
    try {
      const response = await bloopyService.ask(nextMessages.map(({ role, content: text }) => ({ role, content: text })), state, plan, online);
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content: response.text, sources: response.sources }]);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "The online reply did not arrive.";
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content: `My online weather balloon is grounded right now. ${detail} I can still navigate, choose a next step, open resources, and make printables locally.` }]);
    } finally {
      setBusy(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void send(input);
  };

  return <>
    <button className={open ? "bloopy-launcher is-open" : "bloopy-launcher"} onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="bloopy-panel" aria-label={open ? "Close Bloopy" : "Open Bloopy companion"}>
      <span>{open ? <X /> : <MessageCircle />}</span><Bloop mood={mood} size="sm" /><em>{open ? "Close" : "Ask Bloopy"}</em>
    </button>
    {open && <div className="bloopy-scrim" onClick={() => setOpen(false)} aria-hidden="true" />}
    {open && <aside id="bloopy-panel" className="bloopy-panel panel is-open">
      <header className="bloopy-panel__header"><Bloop mood={mood} size="sm" /><span><small>MINDWEATHER COMPANION</small><strong>Bloopy</strong><em>{busy ? "Consulting the clouds…" : online ? "Web search is available when needed" : "App help and local guidance"}</em></span><button onClick={() => setOpen(false)} aria-label="Minimise Bloopy"><Minimize2 /></button></header>
      <div className="bloopy-log" ref={logRef} aria-live="polite">
        {messages.map((message) => <article key={message.id} className={`bloopy-message bloopy-message--${message.role}`}>
          {message.role === "assistant" && <span><Bot /></span>}
          <div><p>{message.content}</p>{message.sources?.length ? <details><summary><Globe2 /> Sources used</summary>{message.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>{source.title}<ExternalLink /></a>)}</details> : null}{message.navigateTo && <button onClick={() => { navigate(message.navigateTo!); setOpen(false); }}>{message.actionLabel}<ArrowRight /></button>}</div>
        </article>)}
        {busy && <div className="bloopy-typing"><LoaderCircle /><span>Bloopy is thinking without making it weird.</span></div>}
      </div>
      {messages.length < 3 && <div className="bloopy-starters">{starters.map(({ label, icon: Icon }) => <button key={label} onClick={() => void send(label)}><Icon />{label}</button>)}</div>}
      <form className="bloopy-compose" onSubmit={submit}>
        <label><span className="sr-only">Ask Bloopy</span><textarea rows={2} maxLength={1200} value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about the app, your next step, or a genuine question…" onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} /></label>
        <div><button type="button" className={online ? "bloopy-online active" : "bloopy-online"} aria-pressed={online} onClick={() => setOnline((value) => !value)} title="Allow Bloopy to search the web for this conversation"><Globe2 />{online ? "Web on" : "Web off"}</button><span><Navigation /> App context included</span><button className="bloopy-send" disabled={!input.trim() || busy} aria-label="Send message"><Send /></button></div>
      </form>
      <footer>Bloopy can be wrong. Web answers show their sources. Wellbeing guidance is not medical care.</footer>
    </aside>}
  </>;
}
