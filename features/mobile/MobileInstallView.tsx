import { Bloop } from "@/components/brand/Bloop";
import { InstallQr } from "@/components/mobile/InstallQr";
import { ArrowRight, Check, Download, Smartphone } from "lucide-react";
import Link from "next/link";

const devices = [
  {
    id: "ios",
    label: "iPhone & iPad",
    eyebrow: "iOS · Safari",
    title: "Add MindWeather to your Home Screen",
    icon: Smartphone,
    steps: ["Scan the QR code with your camera", "Tap Share in Safari", "Choose Add to Home Screen"],
  },
  {
    id: "android",
    label: "Android",
    eyebrow: "Android · Chrome",
    title: "Install MindWeather from your browser",
    icon: Download,
    steps: ["Scan the QR code with your camera", "Open the Chrome menu", "Choose Install app and confirm"],
  },
] as const;

export function MobileInstallView() {
  return (
    <div className="mobile-install-view">
      <header className="view-heading view-heading--row">
        <div>
          <span className="view-heading__eyebrow">MindWeather mobile</span>
          <h1>Take the station with you.</h1>
          <p>Scan the code for your device, then add MindWeather to your Home Screen. It opens like an app and keeps your study space close.</p>
        </div>
        <Link href="/mobile" className="button button--ghost button--small">Full install guide <ArrowRight /></Link>
      </header>

      <section className="mobile-install-cards" aria-label="Mobile installation options">
        {devices.map(({ id, label, eyebrow, title, icon: Icon, steps }) => (
          <article className={`mobile-install-card mobile-install-card--${id} panel`} key={id}>
            <header>
              <span><Icon /></span>
              <div><small>{eyebrow}</small><h2>{title}</h2></div>
            </header>
            <ol>{steps.map((step) => <li key={step}><Check /> {step}</li>)}</ol>
            <InstallQr platform={id} label={label} />
          </article>
        ))}
      </section>

      <div className="mobile-install-note panel">
        <Bloop mood="encouraging" size="sm" />
        <span><strong>No app store needed.</strong><small>MindWeather installs directly from your browser and can be removed like any other Home Screen app.</small></span>
      </div>
    </div>
  );
}
