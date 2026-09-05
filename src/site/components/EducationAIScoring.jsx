import "./EducationAIScoring.css";


function EducationAIScoring() {
  return (
    <section className="education-ai-scoring-section">
      <div className="education-ai-scoring-container">

        
        <div className="education-ai-scoring-content">

          <div className="education-ai-scoring-eyebrow">
            <span className="education-ai-scoring-dot" />
            AI STUDENT INTELLIGENCE
          </div>

          <h2>
            Turn Every Student
            <br />
            <span>Signal Into Action.</span>
          </h2>

          <p className="education-ai-scoring-description">
            GradLead continuously analyzes student activity, intent and
            engagement to help your team know which students deserve
            attention right now.
          </p>

          <div className="education-ai-scoring-points">

           
            <div className="education-ai-scoring-point">
              <span className="scoring-check">✓</span>

              <div>
                <strong>Understand intent</strong>

                <p>
                  See which students are actively moving forward.
                </p>
              </div>
            </div>

            
            <div className="education-ai-scoring-point">
              <span className="scoring-check">✓</span>

              <div>
                <strong>Prioritize opportunities</strong>

                <p>
                  Focus your team on the highest-value conversations.
                </p>
              </div>
            </div>

            
            <div className="education-ai-scoring-point">
              <span className="scoring-check">✓</span>

              <div>
                <strong>Act at the right moment</strong>

                <p>
                  Turn changing student signals into timely action.
                </p>
              </div>
            </div>

          </div>

          <div className="education-ai-scoring-status">
            <span className="status-pulse" />
            AI continuously analyzing student signals
          </div>

        </div>


       
        <div className="education-ai-scoring-visual">

          <div className="education-ai-scoring-glow" />

          <div className="ai-scoring-dashboard">

            {/* DASHBOARD TOP */}
            <div className="ai-dashboard-header">

              <div className="dashboard-title">
                <span className="dashboard-ai-icon">✦</span>

                <div>
                  <strong>Student Intelligence</strong>
                  <small>AI Priority Analysis</small>
                </div>
              </div>

              <span className="dashboard-live">
                <i />
                LIVE
              </span>

            </div>


            {/* MAIN SCORE */}
            <div className="ai-score-area">

              <div className="score-ring">

                <div className="score-ring-inner">
                  <span>AI SCORE</span>
                  <strong>92</strong>
                  <small>HIGH INTENT</small>
                </div>

              </div>

              <div className="score-info">

                <span className="score-label">
                  PRIORITY LEVEL
                </span>

                <h3>
                  High-Intent Student
                </h3>

                <p>
                  Student activity indicates strong enrollment interest.
                </p>

                <div className="score-progress">
                  <span />
                </div>

                <div className="score-progress-labels">
                  <span>Engagement</span>
                  <strong>94%</strong>
                </div>

              </div>

            </div>


            {/* SIGNALS */}
            <div className="ai-signal-list">

              <div className="ai-signal-item">

                <div className="signal-small-icon">↗</div>

                <div className="signal-small-content">
                  <strong>Program Interest</strong>
                  <span>Computer Science</span>
                </div>

                <b>+24%</b>

              </div>


              <div className="ai-signal-item">

                <div className="signal-small-icon">◎</div>

                <div className="signal-small-content">
                  <strong>Engagement</strong>
                  <span>Multiple interactions</span>
                </div>

                <b>High</b>

              </div>


              <div className="ai-signal-item">

                <div className="signal-small-icon">✦</div>

                <div className="signal-small-content">
                  <strong>Intent Detected</strong>
                  <span>Application likely</span>
                </div>

                <b>92</b>

              </div>

            </div>


            {/* AI RECOMMENDATION */}
            <div className="ai-recommendation">

              <div className="recommendation-icon">
                ✦
              </div>

              <div>
                <span>AI RECOMMENDATION</span>

                <strong>
                  Follow up now
                </strong>

                <p>
                  Student is showing increasing intent.
                </p>
              </div>

              <div className="recommendation-arrow">
                →
              </div>

            </div>


            {/* FLOATING AI BADGE */}
            <div className="floating-ai-badge">
              <span>✦</span>
              AI
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default EducationAIScoring;