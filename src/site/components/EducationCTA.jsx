import "./EducationCTA.css";

function EducationCTA() {
  return (
    <section className="education-cta-section">
      {/* Ambient background */}
      <div className="education-cta-glow education-cta-glow-one" />
      <div className="education-cta-glow education-cta-glow-two" />

      {/* Moving particles */}
      <span className="education-cta-particle particle-one" />
      <span className="education-cta-particle particle-two" />
      <span className="education-cta-particle particle-three" />
      <span className="education-cta-particle particle-four" />

      <div className="education-cta-container">

        {/* Eyebrow */}
        <div className="education-cta-eyebrow">
          <span className="education-cta-dot" />
          READY TO GROW ENROLLMENT?
        </div>

        {/* Heading */}
        <h2>
          Turn Student Interest
          <br />
          Into <span>Enrollment.</span>
        </h2>

        {/* Description */}
        <p className="education-cta-description">
          Give your admissions team the intelligence to understand every
          student, prioritize every opportunity, and move conversations
          forward.
        </p>

        {/* Buttons */}
        <div className="education-cta-buttons">

          <a
            href="#"
            className="education-cta-primary"
          >
            Book a Demo
            <span>→</span>
          </a>

          

        </div>

        {/* Trust */}
        <div className="education-cta-trust">

          <div>
            <span>✦</span>
            AI Powered
          </div>

          <div>
            <span>✓</span>
            Intelligent
          </div>

          <div>
            <span>◉</span>
            Built for Education
          </div>

        </div>

      </div>
    </section>
  );
}

export default EducationCTA;