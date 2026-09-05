import "./CTA.css";

export default function CTA() {
  return (
    <section className="cta-section" id="cta">
      <div className="cta-glow cta-glow-left"></div>
      <div className="cta-glow cta-glow-right"></div>

      <div className="cta-container">
        <div className="cta-content">
          <span className="cta-eyebrow">
            READY TO GROW SMARTER?
          </span>

          <h2>
            Turn Better Leads Into
            <span> Better Revenue.</span>
          </h2>

          <p>
            Find the right prospects, understand buying intent, and give your
            sales team everything they need to build a stronger pipeline with
            GradLead.
          </p>

          <div className="cta-actions">
            <a href="#contact" className="cta-primary">
              Get Started
              <span>→</span>
            </a>

            <a href="#features" className="cta-secondary">
              Explore GradLead
            </a>
          </div>

          <div className="cta-points">
            <span>
              <i>✓</i>
              AI-powered prospecting
            </span>

            <span>
              <i>✓</i>
              Better-quality leads
            </span>

            <span>
              <i>✓</i>
              Smarter sales growth
            </span>
          </div>
        </div>

        <div className="cta-visual">
          <div className="cta-orbit cta-orbit-one"></div>
          <div className="cta-orbit cta-orbit-two"></div>

          <div className="cta-dashboard">
            <div className="dashboard-top">
              <span className="dashboard-logo">G</span>

              <div>
                <small>GradLead</small>
                <strong>Growth Overview</strong>
              </div>

              <span className="dashboard-status">Live</span>
            </div>

            <div className="dashboard-stats">
              <div className="dashboard-stat">
                <span>Qualified Leads</span>
                <strong>2,847</strong>
                <small>↗ 24.8%</small>
              </div>

              <div className="dashboard-stat">
                <span>Conversion Rate</span>
                <strong>68.4%</strong>
                <small>↗ 12.6%</small>
              </div>
            </div>

            <div className="dashboard-chart">
              <span className="chart-label">Pipeline Growth</span>

              <div className="chart-bars">
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
              </div>
            </div>
          </div>

          <div className="cta-floating-card cta-card-one">
            <span className="floating-icon">✦</span>

            <div>
              <small>New Opportunity</small>
              <strong>High Intent Lead</strong>
            </div>
          </div>

          <div className="cta-floating-card cta-card-two">
            <span className="floating-check">✓</span>

            <div>
              <small>Pipeline</small>
              <strong>Growing Faster</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}