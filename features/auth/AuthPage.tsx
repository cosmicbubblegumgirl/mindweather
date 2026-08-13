"use client";

import { Bloop } from "@/components/brand/Bloop";
import { Brand } from "@/components/brand/Brand";
import { WeatherBackdrop } from "@/components/brand/WeatherBackdrop";
import { useMindWeather } from "@/hooks/useMindWeather";
import type { AuthAccount } from "@/services/authService";
import { authService } from "@/services/authService";
import {
  googleIdentityConfigured,
  renderGoogleSignIn,
  type GoogleIdentityCredential,
} from "@/services/googleIdentityService";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type AuthMode = "login" | "signup" | "reset";

export function AuthPage({ initialMode = "login" }: { initialMode?: AuthMode }) {
  const router = useRouter();
  const { activateAccount } = useMindWeather();
  const googleButton = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);

  const openAccount = useCallback(async (account: AuthAccount, isNew: boolean) => {
    await activateAccount(account);
    router.push(isNew || !account.onboarded ? "/onboarding" : "/station");
  }, [activateAccount, router]);

  const acceptGoogleIdentity = useCallback(async (identity: GoogleIdentityCredential) => {
    setError("");
    setGoogleLoading(true);
    try {
      const result = await authService.signInWithGoogle(identity);
      await openAccount(result.account, result.isNew);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Google sign-in could not be completed.");
      setGoogleLoading(false);
    }
  }, [openAccount]);

  useEffect(() => {
    const stop = authService.onRecovery(() => {
      setRecoveryReady(true);
      setEmailSent(false);
    });
    if (mode === "reset") {
      void authService.current().then((account) => {
        if (account) setRecoveryReady(true);
      });
    }
    return stop;
  }, [mode]);

  useEffect(() => {
    const element = googleButton.current;
    if (mode === "reset" || !element || !googleIdentityConfigured() || !authService.configured()) return;
    let active = true;
    setGoogleLoading(true);
    renderGoogleSignIn(
      element,
      (identity) => active && void acceptGoogleIdentity(identity),
      (caught) => {
        if (!active) return;
        setError(caught.message);
        setGoogleLoading(false);
      },
    ).then(() => {
      if (active) setGoogleLoading(false);
    }).catch((caught) => {
      if (!active) return;
      setError(caught instanceof Error ? caught.message : "Google sign-in could not be loaded.");
      setGoogleLoading(false);
    });
    return () => { active = false; };
  }, [acceptGoogleIdentity, mode]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setEmailSent(false);
    const needsPassword = mode !== "reset" || recoveryReady;
    if (needsPassword && password.length < 8) {
      setError("Use at least eight characters for your password.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const result = await authService.signUp(name.trim(), email, password);
        if (result.needsEmailConfirmation || !result.account) {
          setEmailSent(true);
          setPassword("");
        } else {
          await openAccount(result.account, true);
        }
      } else if (mode === "login") {
        await openAccount(await authService.login(email, password), false);
      } else if (recoveryReady) {
        await authService.updatePassword(password);
        const account = await authService.current();
        if (!account) throw new Error("Your password changed, but the secure session could not be reopened.");
        await openAccount(account, false);
      } else {
        await authService.resetPassword(email);
        setEmailSent(true);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Your secure account could not be opened.");
    } finally {
      setBusy(false);
    }
  };

  const changeMode = (next: AuthMode) => {
    setMode(next);
    setError("");
    setEmailSent(false);
  };

  const resetTitle = recoveryReady ? "Choose a new password." : "Reset your password.";

  return (
    <main className="auth-page">
      <WeatherBackdrop weather="breezy" />
      <header><Brand /><Link href="/" className="button button--ghost button--small"><ArrowLeft /> Back home</Link></header>
      <div className="auth-layout">
        <section className="auth-story">
          <span>PRIVATE BY DEFAULT</span>
          <h1>Your study weather<br />belongs to you.</h1>
          <p>Create a secure MindWeather account with email or Google. Your account is verified by Supabase and your study space is separated from everyone else&apos;s.</p>
          <div className="auth-orbit"><Bloop mood={mode === "signup" ? "encouraging" : mode === "reset" ? "thinking" : "happy"} size="lg" /><i /><i /><span>One account.<br />Your data.</span></div>
          <ul><li><ShieldCheck /> Passwords are handled by Supabase Auth</li><li><LockKeyhole /> Every database row is protected per user</li><li><Check /> Google Calendar permission stays separate</li></ul>
        </section>
        <section className="auth-card panel">
          <div className="segmented auth-tabs"><button className={mode === "login" ? "active" : ""} onClick={() => changeMode("login")}>Log in</button><button className={mode === "signup" ? "active" : ""} onClick={() => changeMode("signup")}>Sign up</button></div>
          <header><KeyRound /><div><small>{mode === "reset" ? "SECURE ACCOUNT RECOVERY" : mode === "signup" ? "CREATE YOUR ACCOUNT" : "WELCOME BACK"}</small><h2>{mode === "reset" ? resetTitle : mode === "signup" ? "Let&apos;s make a private corner." : "Open your weather station."}</h2></div></header>
          {emailSent && <div className="auth-success"><Check /> {mode === "signup" ? "Check your email to confirm your account, then log in." : "Check your email for the secure reset link."}</div>}
          {mode !== "reset" && <><div className="google-signin"><div ref={googleButton} aria-label="Continue with Google" />{googleLoading && <small>Loading Google sign-in...</small>}{(!googleIdentityConfigured() || !authService.configured()) && <small>Google sign-in is not configured for this deployment.</small>}</div><div className="auth-divider"><span>or use email and password</span></div></>}
          <form onSubmit={submit}>
            {mode === "signup" && <label className="form-field"><span>Name</span><input className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder="What should Bloop call you?" required /></label>}
            {(!recoveryReady || mode !== "reset") && <label className="form-field"><span>Email</span><input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></label>}
            {(mode !== "reset" || recoveryReady) && <label className="form-field"><span>{recoveryReady && mode === "reset" ? "New password" : "Password"}</span><div className="password-input"><input className="input" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label>}
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="button button--peach" disabled={busy || !authService.configured()}>{busy ? "Working..." : mode === "reset" ? recoveryReady ? "Save new password" : "Email reset link" : mode === "signup" ? "Create my account" : "Sign in"}<ArrowRight /></button>
          </form>
          {mode === "login" && <Link href="/forgot-password" className="auth-reset">Forgot your password?</Link>}
          {mode === "reset" && <Link href="/login" className="auth-reset">Back to log in</Link>}
          <Link href="/mobile" className="auth-mobile-link">Use MindWeather on your phone <ArrowRight /></Link>
          <p className="auth-note">Your account and encrypted session are handled by Supabase. Study data syncs only inside your protected account. Google Calendar is optional, read-only, and requested separately inside Calendar.</p>
        </section>
      </div>
    </main>
  );
}
