"use client";

import { Bloop } from "@/components/brand/Bloop";
import { Brand } from "@/components/brand/Brand";
import { WeatherBackdrop } from "@/components/brand/WeatherBackdrop";
import { useMindWeather } from "@/hooks/useMindWeather";
import { authService } from "@/services/authService";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type AuthMode = "login" | "signup" | "reset" | "update";

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
    if (mode !== "reset" && password.length < 8) {
      setError("Use at least eight characters for your password.");
      return;
    }
    if (!authService.available()) {
      setError("Hosted accounts are temporarily unavailable. Please try again shortly.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const account = await authService.signUp(name.trim(), email, password);
        updateProfile({ name: account.name, email: account.email, initials: account.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(), onboarded: false });
        if (account.verified) window.location.href = "/onboarding/";
        else {
          setResetDone(true);
          setMode("login");
          setPassword("");
        }
      } else if (mode === "login") {
        await authService.login(email, password);
        window.location.href = "/station/";
      } else if (mode === "reset") {
        await authService.resetPassword(email);
        setResetDone(true);
        setMode("login");
        setPassword("");
      } else {
        await authService.updatePassword(password);
        window.location.href = "/station/";
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

  return <main className="auth-page"><WeatherBackdrop weather="breezy" /><header><Brand /><Link href="/" className="button button--ghost button--small"><ArrowLeft /> Back home</Link></header><div className="auth-layout"><section className="auth-story"><span>PRIVATE BY DEFAULT</span><h1>Your study weather<br />belongs to you.</h1><p>Your account keeps your study plan available across your devices while protecting each learner’s records.</p><div className="auth-orbit"><Bloop mood={mode === "signup" ? "encouraging" : mode === "reset" || mode === "update" ? "thinking" : "happy"} size="lg" /><i /><i /><span>Your account.<br />Your data.</span></div><ul><li><ShieldCheck /> Secure email and password authentication</li><li><LockKeyhole /> Each account can only access its own records</li><li><Check /> A no-account preview remains available</li></ul></section><section className="auth-card panel">{mode !== "update" && <div className="segmented auth-tabs"><button className={mode === "login" ? "active" : ""} onClick={() => changeMode("login")}>Log in</button><button className={mode === "signup" ? "active" : ""} onClick={() => changeMode("signup")}>Sign up</button></div>}<header><KeyRound /><div><small>{mode === "reset" ? "RESET PASSWORD" : mode === "update" ? "CHOOSE A NEW PASSWORD" : mode === "signup" ? "CREATE AN ACCOUNT" : "WELCOME BACK"}</small><h2>{mode === "reset" ? "Check your inbox." : mode === "update" ? "Make it memorable and private." : mode === "signup" ? "Let's make a private corner." : "Open your weather station."}</h2></div></header>{resetDone && <div className="auth-success"><Check /> Check your email for the confirmation or reset link.</div>}<form onSubmit={submit}>{mode === "signup" && <label className="form-field"><span>Name</span><input className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder="What should Bloop call you?" required /></label>}{mode !== "update" && <label className="form-field"><span>Email</span><input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></label>}{mode !== "reset" && <label className="form-field"><span>{mode === "update" ? "New password" : "Password"}</span><div className="password-input"><input className="input" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label>}{error && <p className="auth-error">{error}</p>}<button className="button button--peach" disabled={busy}>{busy ? "Please wait..." : mode === "reset" ? "Send reset link" : mode === "update" ? "Save new password" : mode === "signup" ? "Create my account" : "Open MindWeather"}<ArrowRight /></button></form>{mode === "login" && <Link href="/forgot-password/" className="auth-reset">Forgot your password?</Link>}{mode === "reset" && <Link href="/login/" className="auth-reset">Back to log in</Link>}{mode !== "update" && <><div className="auth-divider"><span>or</span></div><Link href="/station/" className="button button--ghost">Preview MindWeather without an account</Link><Link href="/mobile/" className="auth-mobile-link">Use MindWeather on your phone <ArrowRight /></Link></>}<p className="auth-note">Account data is encrypted in transit and separated by database access policies.</p></section></div></main>;
}
