import "./EducationHero.css";

import educationDashboard from "../assets/features/education-dashboard.png";

export default function EducationHero() {
  return (
    <section className="education-hero">

      {/* Background decoration */}
      <div className="education-hero-glow education-hero-glow-one" />
      <div className="education-hero-glow education-hero-glow-two" />

      <div className="education-hero-container">

        {/* =========================
            LEFT CONTENT
        ========================= */}
        <div className="education-hero-content">

          <div className="education-hero-eyebrow">
            <span className="education-eyebrow-dot"></span>
            AI-POWERED FOR EDUCATION TEAMS
          </div>

          <h1>
            Turn Every Student
            <br />
            <span>Inquiry Into Opportunity.</span>
          </h1>

          <p className="education-hero-description">
            Bring student inquiries, conversations, follow-ups, and
            admissions opportunities into one intelligent workspace.
            GradLead helps education teams identify high-intent students,
            respond faster, and improve conversions.
          </p>

          <div className="education-hero-buttons">

            <a
              href="#contact"
              className="education-hero-primary"
            >
              Get Started
              <span>→</span>
            </a>

            <a
              href="#education-features"
              className="education-hero-secondary"
            >
              Explore Platform
            </a>

          </div>

          <div className="education-hero-trust">
            <span className="education-trust-icon">✦</span>

            <span>
              Built for modern education & admissions teams
            </span>
          </div>

        </div>


        {/* =========================
            RIGHT DASHBOARD
        ========================= */}
        <div className="education-hero-visual">

          <div className="education-dashboard-glow"></div>

          <div className="education-dashboard-frame">

            <div className="education-dashboard-top-line">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <img
              src={educationDashboard}
              alt="GradLead AI education dashboard"
              className="education-dashboard-image"
            />

          </div>


          {/* Floating card */}
          <div className="education-floating-card">

            <div className="education-floating-icon">
              ✦
            </div>

            <div>
              <strong>AI Student Insights</strong>

              <span>
                Focus on students most ready to convert.
              </span>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}