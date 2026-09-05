import "./EducationLeadProblems.css";

import educationProblemsImage from "../assets/features/education-lead-problems.png";

export default function EducationLeadProblems() {
  return (
    <section
      className="education-problems-section"
      id="education-lead-problems"
    >
      <div className="education-problems-container">

        {/* LEFT CONTENT */}
        <div className="education-problems-content">

          <div className="education-problems-eyebrow">
            <span className="education-problems-dot" />
            EDUCATION LEAD CHALLENGES
          </div>

          <h2>
            Too Many Inquiries.
            <br />
            <span>Not Enough Visibility.</span>
          </h2>

          <p className="education-problems-description">
            Education teams receive inquiries from websites, campaigns,
            social media, and multiple communication channels. Without one
            connected system, valuable student opportunities can easily get
            lost.
          </p>

          <div className="education-problems-list">

            <div className="education-problem-item">
              <span>01</span>
              <div>
                <h3>Scattered Student Inquiries</h3>
                <p>
                  Student leads arrive from multiple sources with no single
                  place to manage them.
                </p>
              </div>
            </div>

            <div className="education-problem-item">
              <span>02</span>
              <div>
                <h3>Manual Lead Qualification</h3>
                <p>
                  Teams spend valuable time identifying which students are
                  genuinely interested.
                </p>
              </div>
            </div>

            <div className="education-problem-item">
              <span>03</span>
              <div>
                <h3>Missed Follow-Ups</h3>
                <p>
                  Delayed responses and inconsistent follow-ups can cause
                  high-intent student opportunities to disappear.
                </p>
              </div>
            </div>

          </div>

        </div>


        {/* RIGHT IMAGE */}
        <div className="education-problems-visual">

          <div className="education-problems-glow" />

          <div className="education-problems-image-frame">

            <div className="education-problems-image-top">
              <span />
              <span />
              <span />
            </div>

            <img
              src={educationProblemsImage}
              alt="Education lead management challenges"
              className="education-problems-image"
            />

          </div>

        </div>

      </div>
    </section>
  );
}