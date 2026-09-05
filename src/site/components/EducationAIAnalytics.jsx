import "./EducationAIAnalytics.css";

const METRICS = [
  {
    label: "Qualified Students",
    value: "1,284",
    change: "+18.6%",
    icon: "✦",
  },
  {
    label: "High-Intent Leads",
    value: "428",
    change: "+24.8%",
    icon: "◎",
  },
  {
    label: "Applications",
    value: "186",
    change: "+16.4%",
    icon: "↗",
  },
];

const INSIGHTS = [
  "MBA inquiries show highest enrollment intent.",
  "Follow-up speed improved conversion momentum.",
  "International students need earlier engagement.",
];

function EducationAIAnalytics() {
  return (
    <section
      className="education-analytics-section"
      id="education-ai-analytics"
    >
      <div className="education-analytics-container">



        <div className="education-analytics-header">

          <div className="education-analytics-eyebrow">
            <span className="analytics-eyebrow-dot" />
            AI ENROLLMENT ANALYTICS
          </div>

          <h2>
            Turn Student Data Into
            <br />
            <span>Enrollment Intelligence.</span>
          </h2>

          <p>
            See where student interest is growing, which leads deserve
            attention, and where your enrollment team can act next.
          </p>

        </div>


        

        <div className="education-analytics-dashboard">

          {/* Ambient glow */}
          <div className="analytics-dashboard-glow" />

          {/* Dashboard top bar */}
          <div className="analytics-dashboard-top">

            <div className="analytics-window-dots">
              <span />
              <span />
              <span />
            </div>

            <div className="analytics-dashboard-title">
              <span className="live-dot" />
              Enrollment Intelligence
            </div>

            <div className="analytics-live-label">
              LIVE
            </div>

          </div>


          

          <div className="analytics-metrics">

            {METRICS.map((metric, index) => (
              <div
                className="analytics-metric-card"
                key={metric.label}
                style={{
                  "--metric-delay": `${index * 0.8}s`,
                }}
              >

                <div className="analytics-metric-icon">
                  {metric.icon}
                </div>

                <div className="analytics-metric-content">

                  <span>
                    {metric.label}
                  </span>

                  <strong>
                    {metric.value}
                  </strong>

                </div>

                <div className="analytics-metric-change">
                  {metric.change}
                </div>

              </div>
            ))}

          </div>


         

          <div className="analytics-main-grid">

            

            <div className="analytics-chart-card">

              <div className="analytics-card-header">

                <div>
                  <span className="analytics-card-label">
                    ENROLLMENT MOMENTUM
                  </span>

                  <h3>
                    Student conversion trend
                  </h3>
                </div>

                <div className="analytics-period">
                  Last 30 days
                </div>

              </div>


              <div className="analytics-chart">

                <div className="chart-grid-line line-one" />
                <div className="chart-grid-line line-two" />
                <div className="chart-grid-line line-three" />
                <div className="chart-grid-line line-four" />

                <div className="chart-y-label label-top">
                  80%
                </div>

                <div className="chart-y-label label-middle">
                  50%
                </div>

                <div className="chart-y-label label-bottom">
                  20%
                </div>


                <svg
                  className="analytics-chart-svg"
                  viewBox="0 0 700 260"
                  preserveAspectRatio="none"
                >

                  <defs>

                    <linearGradient
                      id="analyticsAreaGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="rgba(112,195,144,0.22)"
                      />

                      <stop
                        offset="100%"
                        stopColor="rgba(112,195,144,0)"
                      />
                    </linearGradient>

                  </defs>


                  <path
                    className="analytics-chart-area"
                    d="
                      M0 220
                      L70 205
                      L140 190
                      L210 198
                      L280 160
                      L350 172
                      L420 125
                      L490 140
                      L560 92
                      L630 72
                      L700 42
                      L700 260
                      L0 260
                      Z
                    "
                  />


                  <path
                    className="analytics-chart-line"
                    d="
                      M0 220
                      L70 205
                      L140 190
                      L210 198
                      L280 160
                      L350 172
                      L420 125
                      L490 140
                      L560 92
                      L630 72
                      L700 42
                    "
                  />


                  <circle
                    className="chart-point point-one"
                    cx="280"
                    cy="160"
                    r="5"
                  />

                  <circle
                    className="chart-point point-two"
                    cx="420"
                    cy="125"
                    r="5"
                  />

                  <circle
                    className="chart-point point-three"
                    cx="560"
                    cy="92"
                    r="5"
                  />

                  <circle
                    className="chart-point point-four"
                    cx="700"
                    cy="42"
                    r="6"
                  />

                </svg>


                <div className="chart-signal">
                  <span />
                  AI detected positive momentum
                </div>

              </div>

            </div>


            

            <div className="analytics-insights-card">

              <div className="analytics-insights-header">

                <div className="insights-ai-icon">
                  ✦
                </div>

                <div>
                  <span>
                    AI INSIGHTS
                  </span>

                  <strong>
                    What needs attention
                  </strong>
                </div>

              </div>


              <div className="analytics-insights-list">

                {INSIGHTS.map((insight, index) => (
                  <div
                    className="analytics-insight"
                    key={insight}
                    style={{
                      "--insight-delay": `${index * 1.1}s`,
                    }}
                  >

                    <span className="insight-number">
                      0{index + 1}
                    </span>

                    <p>
                      {insight}
                    </p>

                    <span className="insight-arrow">
                      ↗
                    </span>

                  </div>
                ))}

              </div>


              <div className="analytics-ai-status">

                <span className="analytics-status-dot" />

                AI continuously analyzing enrollment signals

              </div>

            </div>

          </div>


          

          <div className="analytics-bottom-bar">

            <div className="analytics-bottom-icon">
              ✦
            </div>

            <div className="analytics-bottom-text">

              <span>
                GRADLEAD AI RECOMMENDATION
              </span>

              <strong>
                Focus your team on the students most likely to enroll.
              </strong>

            </div>

            <div className="analytics-bottom-score">
              94.2
              <small>AI SCORE</small>
            </div>

          </div>

        </div>


      

        <div className="education-analytics-result">

          <span>✦</span>

          <p>
            Less guessing.
            <strong> More intelligent enrollment decisions.</strong>
          </p>

        </div>

      </div>
    </section>
  );
}

export default EducationAIAnalytics;