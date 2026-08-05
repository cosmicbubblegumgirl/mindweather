import { ClipboardList, ExternalLink } from "lucide-react";

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSde_d9Un6l109vpYoKVFrabv3XWTi46LkIsFU3gA0U_gsz-bQ/viewform";
const EMBED_URL = `${FORM_URL}?embedded=true`;

export function ResearchSurveyView() {
  return (
    <div className="research-survey-page">
      <header className="view-heading view-heading--row research-survey-heading">
        <div>
          <span className="view-heading__eyebrow">MindWeather research</span>
          <h1>Study habits &amp; learning support.</h1>
          <p>Tell us what studying feels like on real days. Your experience helps shape a calmer, more useful MindWeather.</p>
        </div>
        <a className="button button--ghost button--small" href={FORM_URL} target="_blank" rel="noreferrer">
          Open in a new tab <ExternalLink />
        </a>
      </header>

      <section className="research-survey panel" aria-labelledby="research-survey-title">
        <div className="research-survey__intro">
          <span><ClipboardList /></span>
          <div>
            <strong id="research-survey-title">MindWeather learner survey</strong>
            <small>Anonymous research survey · about 8–10 minutes. Answers go directly to Google Forms rather than this device.</small>
          </div>
        </div>
        <iframe
          className="research-survey__frame"
          src={EMBED_URL}
          title="MindWeather study habits and learning support survey"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </section>
    </div>
  );
}
