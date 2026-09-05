import "./RealEstatehero.css";

import realEstateHero from "../assets/real-estate-hero.png";

export default function RealEstateHero() {
  return (
    <section className="real-estate-hero">

      <div className="real-estate-hero-container">

       
        <div className="real-estate-hero-content">

          <div className="real-estate-badge">
            <span className="badge-icon">⌂</span>
            REAL ESTATE SOLUTION
          </div>

          <h1>
            Turn Real Estate
            <br />
            Leads Into
            <br />
            <span>Serious Buyers</span>
          </h1>

          <p className="real-estate-hero-description">
            Capture property inquiries, understand buyer intent,
            prioritize high-value prospects, and engage every lead
            with personalized follow-ups—all from one intelligent
            workspace.
          </p>

          
          <div className="real-estate-hero-buttons">

            <a
              href="/get-started"
              className="real-estate-primary-btn"
            >
              Get Started
              <span>→</span>
            </a>

           

          </div>

      
          <div className="real-estate-stats">

            <div className="real-estate-stat">

              <div className="stat-icon">
                ♧
              </div>

              <strong>
                10K+
              </strong>

              <span>
                Real Estate
                <br />
                Businesses
              </span>

            </div>


            <div className="real-estate-stat">

              <div className="stat-icon">
                ↗
              </div>

              <strong>
                2.5M+
              </strong>

              <span>
                Property Leads
                <br />
                Managed
              </span>

            </div>


            <div className="real-estate-stat">

              <div className="stat-icon">
                ◎
              </div>

              <strong>
                35%+
              </strong>

              <span>
                Higher Conversion
                <br />
                Rates
              </span>

            </div>


            <div className="real-estate-stat">

              <div className="stat-icon">
                ◷
              </div>

              <strong>
                60%+
              </strong>

              <span>
                Faster Response
                <br />
                Time
              </span>

            </div>

          </div>

        </div>
        


      
        <div className="real-estate-hero-visual">

          <div className="hero-glow"></div>

          <img
            src={realEstateHero}
            alt="GradLead AI real estate lead intelligence"
            className="real-estate-hero-image"
          />

        </div>

      </div>

    </section>
  );
}