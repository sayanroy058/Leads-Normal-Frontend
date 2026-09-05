import "./RealEstateCTA.css";
import { Link } from "@/site/router";

function RealEstateCTA() {
  return (
    <section className="real-estate-cta">

      {/* Background effects */}
      <div className="real-estate-cta-glow real-estate-cta-glow-one" />
      <div className="real-estate-cta-glow real-estate-cta-glow-two" />

      <div className="real-estate-cta-grid" />

      <div className="real-estate-cta-container">

        {/* Eyebrow */}
        <div className="real-estate-cta-eyebrow">
          <span className="cta-eyebrow-dot" />
          <span>READY TO CLOSE MORE DEALS?</span>
        </div>

        {/* Heading */}
        <h2>
          Turn More Real Estate Leads
          <br />
          Into <span>Closed Deals.</span>
        </h2>

        {/* Description */}
        <p className="real-estate-cta-description">
          Bring every lead, conversation, and opportunity into one
          intelligent platform — and give your team the AI-powered
          tools to convert faster.
        </p>

        {/* Buttons */}
        <div className="real-estate-cta-buttons">

          <Link
            to="/get-started"
            className="real-estate-cta-primary"
          >
            <span>Get Started</span>
            <span className="cta-arrow">→</span>
          </Link>

          

        </div>

        {/* Bottom trust line */}
        <div className="real-estate-cta-trust">
          <span>Capture</span>
          <i>•</i>
          <span>Qualify</span>
          <i>•</i>
          <span>Engage</span>
          <i>•</i>
          <span>Convert</span>

          <strong> — All with GradLead AI.</strong>
        </div>

      </div>
    </section>
  );
}

export default RealEstateCTA;