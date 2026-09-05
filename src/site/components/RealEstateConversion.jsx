import "./RealEstateConversion.css";

import conversionImage from "../assets/features/conversion.png";

export default function RealEstateConversion() {
  return (
    <section className="real-estate-conversion" id="real-estate-conversion">

      <div className="conversion-container">

        
        <div className="conversion-content">

          <div className="conversion-label">
            CONVERSION INTELLIGENCE
          </div>

          <h2 className="conversion-heading">
            <span className="heading-line">
              Turn Property Interest
            </span>

            <br />

            <span className="heading-highlight">
              Into Real Conversations.
            </span>
          </h2>

          <p className="conversion-description">
            Once a buyer shows intent, GradLead helps your team respond
            with the right message at the right moment. Turn qualified
            property interest into meaningful conversations and move
            opportunities closer to conversion.
          </p>


          <div className="conversion-points">

            <div className="conversion-point">

              <div className="conversion-number">
                01
              </div>

              <div>
                <h3>Smart Follow-Ups</h3>

                <p>
                  Automatically follow up with buyers based on their
                  interests and engagement.
                </p>
              </div>

            </div>


            <div className="conversion-point">

              <div className="conversion-number">
                02
              </div>

              <div>
                <h3>Personalized Conversations</h3>

                <p>
                  Give every prospect a relevant and contextual response.
                </p>
              </div>

            </div>


            <div className="conversion-point">

              <div className="conversion-number">
                03
              </div>

              <div>
                <h3>Move Leads Forward</h3>

                <p>
                  Help sales teams turn high-intent opportunities into
                  property conversations.
                </p>
              </div>

            </div>

          </div>

        </div>


        <div className="conversion-visual">

          <div className="conversion-orb"></div>

          <div className="conversion-image-frame">

            <div className="conversion-image-glow"></div>

            <div className="conversion-image-inner">

              <img
                src={conversionImage}
                alt="GradLead AI property lead conversion"
                className="conversion-image"
              />

            </div>

            {/* Floating AI badge */}
            <div className="conversion-floating-card">

              <div className="conversion-floating-dot"></div>

              <div>
                <span>AI SIGNAL</span>
                <strong>Conversation Ready</strong>
              </div>

            </div>


            {/* Floating conversion score */}
            <div className="conversion-score-card">

              <span>CONVERSION</span>

              <strong>94%</strong>

              <small>High Intent</small>

            </div>

          </div>

        </div>

      </div>


     
      <div className="conversion-bottom">

        <span></span>

        Right message. Right moment. Better property conversations.

      </div>

    </section>
  );
}