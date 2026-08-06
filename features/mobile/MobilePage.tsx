"use client";

import { Bloop } from "@/components/brand/Bloop";
import { Brand } from "@/components/brand/Brand";
import { WeatherBackdrop } from "@/components/brand/WeatherBackdrop";
import { InstallQr } from "@/components/mobile/InstallQr";
import { ArrowLeft, Check, Download, Smartphone, Sparkles } from "lucide-react";
import Link from "next/link";

export function MobilePage() {
  return (
    <main className="mobile-page">
      <WeatherBackdrop weather="clear" quiet />
      <header className="mobile-page__nav"><Brand /><Link href="/" className="button button--ghost button--small"><ArrowLeft /> Back home</Link></header>
      <section className="mobile-hero">
        <div>
          <span className="eyebrow"><i /> Your weather station, pocket-sized</span>
          <h1>Keep the plan<br /><em>close to you.</em></h1>
          <p>MindWeather is designed to live comfortably on your phone. This local build installs as a private web app, so your study records stay on this device.</p>
          <div className="mobile-hero__actions"><a href="#ios" className="button button--peach"><Smartphone /> iPhone install</a><a href="#android" className="button button--violet"><Download /> Android install</a></div>
          <small className="mobile-hero__note">No app store account required · Works offline after install</small>
        </div>
        <div className="mobile-phone" aria-label="MindWeather mobile preview"><div className="mobile-phone__notch" /><div className="mobile-phone__screen"><div className="mobile-phone__top"><span>9:41</span><i /><span>100%</span></div><div className="mobile-phone__brand"><Brand compact /></div><span className="mobile-phone__eyebrow">GOOD MORNING, SIMONE</span><h2>What kind of brain day?</h2><div className="mobile-phone__weather"><span className="active">ϟ</span><span>☀</span><span>≋</span></div><div className="mobile-phone__plan"><small>YOUR NEXT STEP</small><strong>Open your research notes</strong><span>8 gentle minutes <i /></span></div><Bloop mood="encouraging" size="sm" /></div></div>
      </section>
      <section className="mobile-install-grid">
        <article id="ios" className="mobile-platform panel"><span className="mobile-platform__icon"><Smartphone /></span><div><span>iOS · iPhone &amp; iPad</span><h2>Add to your Home Screen</h2><ol><li><Check /> Open MindWeather in Safari.</li><li><Check /> Tap Share, then &quot;Add to Home Screen&quot;.</li><li><Check /> Open the new icon like a private app.</li></ol><a href="/station" className="button button--ghost button--small">Open the station <Sparkles /></a><InstallQr platform="ios" label="iOS" /></div></article>
        <article id="android" className="mobile-platform panel"><span className="mobile-platform__icon"><Download /></span><div><span>Android · phones &amp; tablets</span><h2>Install from your browser</h2><ol><li><Check /> Open MindWeather in Chrome.</li><li><Check /> Tap the menu, then &quot;Install app&quot;.</li><li><Check /> Confirm and keep studying offline.</li></ol><a href="/station" className="button button--ghost button--small">Open the station <Sparkles /></a><InstallQr platform="android" label="Android" /></div></article>
      </section>
      <footer className="mobile-page__footer"><Bloop mood="happy" size="sm" /><span>One calm little app for real brains on real days.</span><Link href="/signup">Create a private profile <Sparkles /></Link></footer>
    </main>
  );
}
