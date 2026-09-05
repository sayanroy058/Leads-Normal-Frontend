import "./RealEstateQualification.css";

import qualificationImage from "../assets/features/qualification.png";


export default function RealEstateQualification() {
  return (
    <section className="real-estate-qualification">

      <div className="qualification-container">

        <div className="qualification-content">

          <div className="qualification-label">
            AI-POWERED QUALIFICATION
          </div>

          <h2 className="qualification-heading">
            Know Which Property
            <br />
            <span>Leads Are Ready.</span>
          </h2>

          <p className="qualification-description">
            Not every property inquiry deserves the same attention.
            GradLead uses AI to understand buyer intent, property
            preferences, engagement signals, and conversation context
            so your team can focus on the opportunities that matter most.
          </p>

          <div className="qualification-points">

            <div className="qualification-point">
              <div className="qualification-check">✓</div>

              <div>
                <strong>AI Lead Scoring</strong>
                <span>
                  Automatically identify high-intent property buyers.
                </span>
              </div>
            </div>

            <div className="qualification-point">
              <div className="qualification-check">✓</div>

              <div>
                <strong>Buyer Intent Signals</strong>
                <span>
                  Understand who is browsing, comparing, or ready to act.
                </span>
              </div>
            </div>

            <div className="qualification-point">
              <div className="qualification-check">✓</div>

              <div>
                <strong>Sales-Ready Opportunities</strong>
                <span>
                  Give your team a clear priority for every conversation.
                </span>
              </div>
            </div>

          </div>
        </div>


        {/* =========================
            RIGHT — IMAGE FRAME
        ========================= */}
        <div className="qualification-visual">

          <div className="qualification-glow"></div>

          <div className="qualification-image-frame">

            <div className="qualification-image-inner">

              <img
                src={qualificationImage}
                alt="AI powered lead qualification"
                className="qualification-image"
              />

            </div>

            {/* Floating AI badge */}
            <div className="qualification-floating-badge">
              <span className="qualification-ai-dot"></span>
              AI Qualification
            </div>

          </div>

        </div>

      </div>


      {/* =========================
          BOTTOM MESSAGE
      ========================= */}
      <div className="qualification-bottom">
        <span></span>
        Less guessing. More conversations with buyers who are ready.
      </div>

    </section>
  );
}