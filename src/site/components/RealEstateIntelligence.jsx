import "./RealEstateIntelligence.css";

export default function RealEstateIntelligence() {
  return (
    <section
      className="real-estate-intelligence"
      id="real-estate-intelligence"
    >
      <div className="intelligence-container">

        <div className="intelligence-visual">

          <div className="intelligence-glow"></div>

          <div className="intelligence-dashboard">

            <div className="dashboard-top">
              <div>
                <span className="dashboard-eyebrow">
                  REAL ESTATE CRM
                </span>

                <h3>Lead Intelligence</h3>
              </div>

              <div className="dashboard-live">
                <span></span>
                Live
              </div>
            </div>

            <div className="dashboard-leads">

              <div className="dashboard-lead lead-highlight">
                <div className="lead-avatar">A</div>

                <div className="lead-details">
                  <strong>Apartment Buyer</strong>
                  <span>3 BHK • Mumbai</span>
                </div>

                <div className="lead-intent">
                  <strong>94</strong>
                  <span>High Intent</span>
                </div>
              </div>

              <div className="dashboard-lead">
                <div className="lead-avatar">R</div>

                <div className="lead-details">
                  <strong>Property Investor</strong>
                  <span>Commercial • Delhi</span>
                </div>

                <div className="lead-intent">
                  <strong>87</strong>
                  <span>Qualified</span>
                </div>
              </div>

              <div className="dashboard-lead">
                <div className="lead-avatar">S</div>

                <div className="lead-details">
                  <strong>Home Buyer</strong>
                  <span>Villa • Bangalore</span>
                </div>

                <div className="lead-intent">
                  <strong>79</strong>
                  <span>Interested</span>
                </div>
              </div>

              <div className="dashboard-lead">
                <div className="lead-avatar">M</div>

                <div className="lead-details">
                  <strong>First-Time Buyer</strong>
                  <span>2 BHK •Kolkata</span>
                </div>

                <div className="lead-intent">
                  <strong>72</strong>
                  <span>Engaged</span>
                </div>
              </div>

            </div>

            <div className="dashboard-summary">
              <div>
                <span>Total Leads</span>
                <strong>2,847</strong>
              </div>

              <div>
                <span>High Intent</span>
                <strong>426</strong>
              </div>

              <div>
                <span>Response Rate</span>
                <strong>91%</strong>
              </div>
            </div>

          </div>
        </div>

        <div className="intelligence-content">

          <div className="intelligence-label">
            REAL ESTATE LEAD INTELLIGENCE
          </div>

          <h2>
            Every Property Lead.
            <br />
            <span>One Intelligent Workspace.</span>
          </h2>

          <p className="intelligence-description">
            Stop managing property inquiries across spreadsheets,
            inboxes, portals, and disconnected tools. GradLead brings
            every lead into one intelligent workspace so your team can
            understand intent, prioritize opportunities, and take action
            at the right moment.
          </p>

          <div className="intelligence-features">

            <div className="intelligence-feature">
              <div className="feature-number">01</div>

              <div>
                <h3>Capture Every Inquiry</h3>
                <p>
                  Bring property leads from websites, portals,
                  campaigns, and social channels into one place.
                </p>
              </div>
            </div>

            <div className="intelligence-feature">
              <div className="feature-number">02</div>

              <div>
                <h3>Understand Buyer Intent</h3>
                <p>
                  Identify which prospects are actively looking,
                  comparing properties, or ready to move forward.
                </p>
              </div>
            </div>

            <div className="intelligence-feature">
              <div className="feature-number">03</div>

              <div>
                <h3>Prioritize High-Value Leads</h3>
                <p>
                  Surface the prospects most likely to convert
                  so your sales team knows where to focus first.
                </p>
              </div>
            </div>

            <div className="intelligence-feature">
              <div className="feature-number">04</div>

              <div>
                <h3>Engage at the Right Moment</h3>
                <p>
                  Give every buyer timely and personalized
                  follow-ups based on their interests and behavior.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

      <div className="intelligence-bottom">
        <span></span>
        Less lead management. More property conversations that convert.
      </div>

    </section>
  );
}