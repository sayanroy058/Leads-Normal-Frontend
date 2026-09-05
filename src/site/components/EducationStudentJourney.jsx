import "./EducationStudentJourney.css";

const JOURNEY_STEPS = [
  {
    number: "01",
    label: "FIRST SIGNAL",
    title: "Student Arrives",
    text: "A student discovers your institution through a campaign, website, referral or enquiry.",
    icon: "↗",
  },
  {
    number: "02",
    label: "UNDERSTANDING",
    title: "Intent Becomes Clear",
    text: "Every interaction helps GradLead understand what the student is interested in.",
    icon: "✦",
  },
  {
    number: "03",
    label: "NEXT ACTION",
    title: "Team Knows What To Do",
    text: "Your team gets a clear signal about the right conversation and next step.",
    icon: "→",
  },
  {
    number: "04",
    label: "OUTCOME",
    title: "Enrollment Moves Forward",
    text: "High-intent students receive timely attention and move closer to enrollment.",
    icon: "✓",
  },
];

function EducationStudentJourney() {
  return (
    <section
      className="education-student-journey"
      id="student-journey"
    >
      <div className="education-student-journey-container">

        {/* =========================
            HEADER
        ========================= */}

        <div className="student-journey-header">

          <div className="student-journey-label">
            <span className="student-journey-label-dot" />
            THE STUDENT JOURNEY
          </div>

          <h2>
            See The Journey.
            <br />
            <span>Not Just The Lead.</span>
          </h2>

          <p>
            GradLead connects every student interaction into one clear
            journey, helping your team understand what happened, what
            matters and what should happen next.
          </p>

        </div>


        {/* =========================
            JOURNEY WRAPPER
        ========================= */}

        <div className="student-journey-wrapper">

          {/* TOP LABEL */}

          <div className="journey-top-label">
            <span>STUDENT SIGNAL</span>
            <span>AI UNDERSTANDING</span>
            <span>TEAM ACTION</span>
            <span>ENROLLMENT</span>
          </div>


          {/* MAIN JOURNEY */}

          <div className="student-journey-track">

            <div className="journey-track-line" />

            {JOURNEY_STEPS.map((step) => (
              <div
                className="student-journey-item"
                key={step.number}
              >

                {/* NODE */}

                <div className="student-journey-node">
                  <span>{step.icon}</span>
                </div>


                {/* CONTENT */}

                <div className="student-journey-content">

                  <span className="journey-step-number">
                    {step.number}
                  </span>

                  <span className="journey-step-label">
                    {step.label}
                  </span>

                  <h3>{step.title}</h3>

                  <p>{step.text}</p>

                </div>

              </div>
            ))}

          </div>


         

          <div className="student-journey-insight">

            <div className="journey-insight-symbol">
              ✦
            </div>

            <div className="journey-insight-text">

              <span>GRADLEAD AI</span>

              <strong>
                From scattered interactions to one clear student story.
              </strong>

            </div>

            <div className="journey-insight-status">
              <span />
              CONNECTED
            </div>

          </div>

        </div>


        {/* =========================
            BOTTOM STATEMENT
        ========================= */}

        <div className="student-journey-bottom">

          <span className="bottom-line" />

          <p>
            Every signal adds context.
            <strong> Every context creates a better next action.</strong>
          </p>

          <span className="bottom-line" />

        </div>

      </div>
    </section>
  );
}

export default EducationStudentJourney;