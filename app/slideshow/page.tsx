'use client';

import { useEffect, useState } from 'react';

const slides = [
  {
    title: 'Welcome to MindWeather',
    route: '/',
    blurb: 'A calm landing page that says your brain is not a machine and your plan does not need to be cruel.',
    accent: 'Cloudy with a chance of clarity',
  },
  {
    title: 'Weather Station',
    route: '/station',
    blurb: 'This is the main cockpit: weather, energy, focus, and a gentler plan that actually listens.',
    accent: 'The mood ring for your study day',
  },
  {
    title: 'Authentication',
    route: '/login · /signup · /forgot-password',
    blurb: 'Login, sign up, and recover your password without turning the experience into a tiny hostage situation.',
    accent: 'Soft doors, not locked gates',
  },
  {
    title: 'Tasks',
    route: '/tasks',
    blurb: 'A task board with filters, drag-and-drop, and enough structure to feel useful without becoming a tyrant.',
    accent: 'Tiny wins with better manners',
  },
  {
    title: 'Focus Tunnel',
    route: '/focus',
    blurb: 'A focused work space that knows you might need a pause, a reflection, or a tiny victory lap.',
    accent: 'Deep work with a human heartbeat',
  },
  {
    title: 'Brain Forecast',
    route: '/forecast',
    blurb: 'Past patterns become a gentle forecast instead of a prophecy written by a very judgmental crystal ball.',
    accent: 'A weather report for your attention',
  },
  {
    title: 'Study DNA',
    route: '/study-dna',
    blurb: 'Your habits become a map of what works, what drains you, and where the plot twists are hiding.',
    accent: 'Your personal learning fingerprint',
  },
  {
    title: 'Constellations',
    route: '/constellation',
    blurb: 'Knowledge grows like stars that brighten when they finally connect, which is deeply satisfying.',
    accent: 'A night sky built from understanding',
  },
  {
    title: 'Mistake Garden',
    route: '/garden',
    blurb: 'Errors are re-homed as lessons, because growth should feel less like punishment and more like compost.',
    accent: 'Weeds with a backstory',
  },
  {
    title: 'Ghost Notes',
    route: '/notes',
    blurb: 'Little scraps of memory, half-formed thoughts, and the occasional brilliant breadcrumb left behind.',
    accent: 'The app remembers the bits your brain would rather not lose',
  },
  {
    title: 'Quiet Rooms',
    route: '/rooms',
    blurb: 'A place for focus, calm, and the kind of silence that says “you can do one thing for a while.”',
    accent: 'Tiny rooms for big thoughts',
  },
  {
    title: 'Calendar, Journal, and Settings',
    route: '/calendar · /journal · /settings',
    blurb: 'The life-admin layer that still remembers you are a human being with a schedule, feelings, and opinions.',
    accent: 'Order without turning into a spreadsheet',
  },
  {
    title: 'Mobile Install',
    route: '/mobile',
    blurb: 'The same gentle study environment, now pocket-sized and ready to greet you in the middle of chaos.',
    accent: 'A tiny weather station for your pocket',
  },
];

export default function SlideshowPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault();
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const slide = slides[currentSlide];

  return (
    <main className="slideshow-shell">
      <style jsx global>{`
        :root {
          color-scheme: dark;
        }
        body {
          margin: 0;
          font-family: Inter, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #0b0919 0%, #1c1740 45%, #0f172a 100%);
          color: #f8f6ff;
        }
        * { box-sizing: border-box; }
        .slideshow-shell {
          min-height: 100vh;
          padding: 32px 20px 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-image: radial-gradient(circle at top left, rgba(251,191,36,0.14), transparent 34%), radial-gradient(circle at bottom right, rgba(96,165,250,0.16), transparent 32%);
        }
        .slideshow-card {
          width: min(100%, 940px);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 28px;
          padding: 28px;
          background: rgba(7, 10, 24, 0.84);
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(16px);
        }
        .slideshow-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          color: #ffd9b3;
          font-size: 0.82rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }
        .pill-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .pill {
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(255,255,255,0.06);
          color: #dbeafe;
          font-size: 0.85rem;
        }
        .slide-content {
          border-radius: 24px;
          padding: 24px;
          background: linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04));
          border: 1px solid rgba(255,255,255,0.08);
          min-height: 380px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 18px;
        }
        .slide-title {
          font-size: clamp(1.6rem, 3vw, 2.4rem);
          line-height: 1.1;
          margin: 0;
        }
        .slide-route {
          font-size: 1rem;
          color: #fbbf24;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .slide-blurb {
          font-size: 1.1rem;
          line-height: 1.7;
          color: #e6e7ff;
          max-width: 720px;
        }
        .accent {
          padding: 12px 14px;
          border-left: 3px solid #8b5cf6;
          background: rgba(139, 92, 246, 0.15);
          border-radius: 12px;
          color: #f5e9ff;
          font-style: italic;
        }
        .nav-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 18px;
          gap: 12px;
          flex-wrap: wrap;
        }
        .button-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        button {
          border: 0;
          border-radius: 999px;
          padding: 10px 14px;
          background: #f8fafc;
          color: #0f172a;
          font-weight: 700;
          cursor: pointer;
        }
        button.secondary {
          background: rgba(255,255,255,0.1);
          color: #f8fafc;
        }
        .dots {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
        }
        .dot.active {
          background: #fbbf24;
          transform: scale(1.18);
        }
        @media (max-width: 700px) {
          .slideshow-card { padding: 18px; }
          .slide-content { min-height: 320px; padding: 18px; }
        }
      `}</style>

      <section className="slideshow-card">
        <div className="slideshow-top">
          <span className="eyebrow">MindWeather demo deck</span>
          <div className="pill-row">
            <span className="pill">Features & pages</span>
            <span className="pill">Quirky summaries</span>
          </div>
        </div>

        <div className="slide-content">
          <div>
            <div className="slide-route">{slide.route}</div>
            <h2 className="slide-title">{slide.title}</h2>
            <p className="slide-blurb">{slide.blurb}</p>
          </div>
          <div className="accent">{slide.accent}</div>
        </div>

        <div className="nav-row">
          <div className="dots" aria-label="Slide navigation">
            {slides.map((_, index) => (
              <span key={index} className={`dot ${index === currentSlide ? 'active' : ''}`} />
            ))}
          </div>
          <div className="button-row">
            <button className="secondary" onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}>
              ← Previous
            </button>
            <button onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}>
              Next →
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
