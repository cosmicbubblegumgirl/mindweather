"use client";

import { Bloop } from "@/components/brand/Bloop";
import { Brand } from "@/components/brand/Brand";
import { WeatherBackdrop } from "@/components/brand/WeatherBackdrop";
import { useMindWeather } from "@/hooks/useMindWeather";
import { authService } from "@/services/authService";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type AuthMode = "login" | "signup" | "reset";

export function AuthPage({ initialMode = "login" }: { initialMode?: AuthMode }) {
  const { updateProfile } = useMindWeather();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Use at least eight characters for this local password.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const account = await authService.signUp(name.trim(), email, password);
        updateProfile({ name: account.name, email: account.email, initials: account.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(), onboarded: false });
        window.location.href = "/onboarding";
      } else if (mode === "login") {
        await authService.login(email, password);
        window.location.href = "/station";
      } else {
        await authService.resetPassword(email, password);
        setResetDone(true);
        setMode("login");
        setPassword("");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The local profile could not be opened.");
    } finally {
      setBusy(false);
    }
  };

  const changeMode = (next: AuthMode) => {
    setMode(next);
    setError("");
    setResetDone(false);
  };

  return <main className="auth-page"><WeatherBackdrop weather="breezy" /><header><Brand /><Link href="/" className="button button--ghost button--small"><ArrowLeft /> Back home</Link></header><div className="auth-layout"><section className="auth-story"><span>PRIVATE BY DEFAULT</span><h1>Your study weather<br />belongs to you.</h1><p>A local profile adds a small layer of privacy on this device. Nothing is sent to a server.</p><div className="auth-orbit"><Bloop mood={mode === "signup" ? "encouraging" : mode === "reset" ? "thinking" : "happy"} size="lg" /><i /><i /><span>One device.<br />Your data.</span></div><ul><li><ShieldCheck /> Password is hashed before local storage</li><li><LockKeyhole /> Study history remains in this browser</li><li><Check /> Demo mode works without signing in</li></ul></section><section className="auth-card panel"><div className="segmented auth-tabs"><button className={mode === "login" ? "active" : ""} onClick={() => changeMode("login")}>Log in</button><button className={mode === "signup" ? "active" : ""} onClick={() => changeMode("signup")}>Sign up</button></div><header><KeyRound /><div><small>{mode === "reset" ? "RESET LOCAL PASSWORD" : mode === "signup" ? "CREATE A LOCAL PROFILE" : "WELCOME BACK"}</small><h2>{mode === "reset" ? "Choose a new key." : mode === "signup" ? "Let's make a private corner." : "Open your weather station."}</h2></div></header>{resetDone && <div className="auth-success"><Check /> Password updated on this device.</div>}<form onSubmit={submit}>{mode === "signup" && <label className="form-field"><span>Name</span><input className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder="What should Bloop call you?" required /></label>}<label className="form-field"><span>Email label</span><input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></label><label className="form-field"><span>{mode === "reset" ? "New local password" : "Local password"}</span><div className="password-input"><input className="input" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label>{error && <p className="auth-error">{error}</p>}<button className="button button--peach" disabled={busy}>{busy ? "Opening the station..." : mode === "reset" ? "Update password" : mode === "signup" ? "Create my profile" : "Open MindWeather"}<ArrowRight /></button></form>{mode === "login" && <Link href="/forgot-password" className="auth-reset">Forgot the local password?</Link>}{mode === "reset" && <Link href="/login" className="auth-reset">Back to log in</Link>}<div className="auth-divider"><span>or</span></div><Link href="/station" className="button button--ghost">Continue with the lively demo</Link><Link href="/mobile" className="auth-mobile-link">Use MindWeather on your phone <ArrowRight /></Link><p className="auth-note">Email verification and cloud sign-in are intentionally disabled in this local-only build. The architecture notes explain how to enable them later.</p></section></div></main>;
}
