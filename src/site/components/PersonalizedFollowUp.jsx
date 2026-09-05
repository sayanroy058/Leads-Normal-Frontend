import "./PersonalizedFollowUp.css";
import personalizedFollowupImg from "../assets/personalized-followup.png";

export default function PersonalizedFollowUp() {
  return (
    <section className="personalized-followup">
      <div className="personalized-followup-container">

        <div className="personalized-followup-content">

          <span className="personalized-followup-badge">
            AI-POWERED FOLLOW-UP
          </span>

          <h2>
            Personalized Follow-Ups{" "}
            <span>That Convert</span>
          </h2>

          <p>
            Engage every buyer with personalized messages based on their
            property interest, behavior, and buying intent. GradeLead helps
            your team follow up at the right time with the right message.
          </p>

          <div className="followup-points">

            <div className="followup-point">
              <span className="followup-point-icon">✓</span>
              <p>Personalized buyer communication</p>
            </div>

            <div className="followup-point">
              <span className="followup-point-icon">✓</span>
              <p>Context-aware AI messaging</p>
            </div>

            <div className="followup-point">
              <span className="followup-point-icon">✓</span>
              <p>Faster and smarter follow-ups</p>
            </div>

          </div>

        </div>


        {/* ================= RIGHT IMAGE ================= */}
        <div className="personalized-followup-visual">

          <div className="personalized-followup-image-frame">
            <img
              src={personalizedFollowupImg}
              alt="Personalized Follow-Up"
              className="personalized-followup-image"
            />
          </div>

        </div>

      </div>
    </section>
  );
}