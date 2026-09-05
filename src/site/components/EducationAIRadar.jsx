import "./EducationAIRadar.css";

import gradleadLogo from "../assets/gradlead-logo.png";

function EducationAIRadar() {
  return (
    <section className="education-ai-radar-section" id="ai-student-intelligence">

      {/* Background */}
      <div className="radar-bg-glow radar-bg-glow-one"></div>
      <div className="radar-bg-glow radar-bg-glow-two"></div>

      <div className="education-ai-radar-container">

       

        <div className="education-radar-visual">

          <div className="radar-ambient-glow"></div>

          
          <div className="radar-system">

            
            <div className="radar-ring radar-ring-one"></div>
            <div className="radar-ring radar-ring-two"></div>
            <div className="radar-ring radar-ring-three"></div>
            <div className="radar-ring radar-ring-four"></div>

           
            <div className="radar-cross radar-cross-horizontal"></div>
            <div className="radar-cross radar-cross-vertical"></div>

            <div className="radar-sweep"></div>

           
            <span className="radar-dot radar-dot-one"></span>
            <span className="radar-dot radar-dot-two"></span>
            <span className="radar-dot radar-dot-three"></span>
            <span className="radar-dot radar-dot-four"></span>

            
            <div className="radar-core">

              <div className="radar-core-ring"></div>

              <div className="radar-core-inner">

                <img
                  src={gradleadLogo}
                  alt="GradLead AI"
                  className="radar-logo"
                />

                <span className="radar-core-title">
                  AI
                </span>

                <span className="radar-core-subtitle">
                  CORE
                </span>

              </div>

            </div>

          </div>


         

          <div className="radar-student-card radar-card-top">

            <div className="radar-card-icon">
              ✦
            </div>

            <div className="radar-card-content">
              <strong>New Inquiry</strong>
              <span>Priya • MBA Program</span>
            </div>

            <span className="radar-status-dot"></span>

          </div>


          <div className="radar-student-card radar-card-right">

            <div className="radar-card-icon radar-icon-star">
              ★
            </div>

            <div className="radar-card-content">
              <strong>High Priority</strong>
              <span>Neha • B.Com Program</span>
            </div>

            <span className="radar-status-dot"></span>

          </div>


          <div className="radar-student-card radar-card-left">

            <div className="radar-card-icon radar-icon-clock">
              ◷
            </div>

            <div className="radar-card-content">
              <strong>Needs Follow-up</strong>
              <span>Rohan • B.Tech Program</span>
            </div>

            <span className="radar-status-dot"></span>

          </div>


          <div className="radar-student-card radar-card-bottom-left">

            <div className="radar-card-icon radar-icon-file">
              □
            </div>

            <div className="radar-card-content">
              <strong>Application Started</strong>
              <span>Ananya • BBA Program</span>
            </div>

            <span className="radar-status-dot"></span>

          </div>


          <div className="radar-student-card radar-card-bottom">

            <div className="radar-card-icon radar-icon-intent">
              ↗
            </div>

            <div className="radar-card-content">
              <strong>High Intent</strong>
              <span>Karan • MBA Program</span>
            </div>

            <span className="radar-status-dot"></span>

          </div>


          <div className="radar-active-label">

            <div className="radar-active-icon">
              ◎
            </div>

            <div>
              <strong>AI Radar Active</strong>
              <span>Scanning student signals...</span>
            </div>

          </div>

        </div>


       
        <div className="education-ai-radar-content">

          <div className="education-radar-eyebrow">
            <span className="education-radar-eyebrow-icon">
              ✦
            </span>

            AI MAGIC DESK
          </div>


          <h2>
            AI Radar for
            <span> Every Student Opportunity.</span>
          </h2>


          <p className="education-radar-description">
            GradLead AI continuously scans, understands, and prioritizes
            student signals so your team can focus on the right students
            and take action at the right time.
          </p>


         

          <div className="education-radar-features">

            <div className="education-radar-feature">

              <div className="radar-feature-icon radar-feature-green">
                ◎
              </div>

              <div>
                <h3>AI Signal Detection</h3>

                <p>
                  Capture inquiries from every channel and detect
                  real-time student interest signals.
                </p>
              </div>

            </div>


            <div className="education-radar-feature">

              <div className="radar-feature-icon radar-feature-purple">
                ✦
              </div>

              <div>
                <h3>Intent Intelligence</h3>

                <p>
                  Understand each student's intent, program interest,
                  and admission readiness.
                </p>
              </div>

            </div>


            <div className="education-radar-feature">

              <div className="radar-feature-icon radar-feature-yellow">
                ◷
              </div>

              <div>
                <h3>Smart Prioritization</h3>

                <p>
                  AI ranks and highlights high-potential students
                  who need immediate attention.
                </p>
              </div>

            </div>


            <div className="education-radar-feature">

              <div className="radar-feature-icon radar-feature-blue">
                ↗
              </div>

              <div>
                <h3>Timely Action</h3>

                <p>
                  Get suggested next actions and automate follow-ups
                  to convert student's interest into a student's enrollment.
                </p>
              </div>

            </div>

          </div>


          
          <div className="education-radar-status">

            <div className="radar-status-bot">
              ✦
            </div>

            <div className="radar-status-content">

              <strong>
                AI is always working for you
              </strong>

              <span>
                24/7 scanning · Real-time insights · Smarter actions
              </span>

              <div className="radar-progress">
                <span></span>
              </div>

              <small>
                Radar active and scanning student signals....
              </small>

            </div>

          </div>

        </div>

      </div>


     

      <div className="education-radar-metrics">

        <div className="radar-metric">
          <strong>12K+</strong>
          <span>Total Inquiries</span>
        </div>

        <div className="radar-metric">
          <strong>3.2K+</strong>
          <span>High Intent Students</span>
        </div>

        <div className="radar-metric">
          <strong>92%</strong>
          <span>Follow-up Success</span>
        </div>

        <div className="radar-metric">
          <strong>2.4X</strong>
          <span>Higher Enrollment</span>
        </div>

      </div>

    </section>
  );
}

export default EducationAIRadar;