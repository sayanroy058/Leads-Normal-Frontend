import "./AILeadIntelligence.css";

import intelligenceImage from "../assets/features/AILeadIntelligence.png";

const INSIGHTS = [
  {
    number: "01",
    title: "High Intent",
    text: "Identify leads showing strong buying signals.",
  },
  {
    number: "02",
    title: "Engagement",
    text: "Understand which prospects are actively engaging.",
  },
  {
    number: "03",
    title: "AI Recommendation",
    text: "Know exactly which lead deserves attention next.",
  },
];

function AILeadIntelligence() {
  return (
    <section className="ai-intelligence-section">
      {/* Background decoration */}
      <div className="ai-intelligence-orb ai-orb-one" />
      <div className="ai-intelligence-orb ai-orb-two" />

      <div className="ai-intelligence-container">

        {/* =========================
            LEFT CONTENT
        ========================== */}
        <div className="ai-intelligence-content">

          <div className="ai-intelligence-eyebrow">
            <span className="ai-eyebrow-dot" />
            AI LEAD INTELLIGENCE
          </div>

          <h2>
            Know which
            <br />
            <span>leads matter most.</span>
          </h2>

          <p className="ai-intelligence-description">
            GradLead turns scattered lead activity into intelligent signals,
            helping your team understand intent, engagement and buying
            potential at a glance.
          </p>

          {/* Insight cards */}
          <div className="ai-insights">
            {INSIGHTS.map((insight, index) => (
              <div
                className="ai-insight-card"
                key={insight.number}
                style={{
                  "--card-delay": `${index * 0.12}s`,
                }}
              >
                <div className="ai-insight-number">
                  {insight.number}
                </div>

                <div className="ai-insight-info">
                  <h3>{insight.title}</h3>
                  <p>{insight.text}</p>
                </div>

                <div className="ai-insight-arrow">↗</div>
              </div>
            ))}
          </div>

        </div>

        {/* =========================
            RIGHT VISUAL
        ========================== */}
        <div className="ai-intelligence-visual">

          <div className="ai-visual-glow" />

          <div className="ai-image-frame">

            <div className="ai-image-top-line" />

            <img
              src={intelligenceImage}
              alt="GradLead AI Lead Intelligence"
              className="ai-intelligence-image"
            />

          </div>

          {/* Floating status */}
          <div className="ai-floating-status">
            <span className="ai-status-dot" />

            <div>
              <strong>AI Analysis Active</strong>
              <span>Signals updating in real time</span>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom statement */}
      <div className="ai-intelligence-result">
        <span className="ai-result-dot" />

        <span>
          From <strong>raw activity</strong> to{" "}
          <strong>actionable intelligence</strong>
        </span>
      </div>

    </section>
  );
}

export default AILeadIntelligence;