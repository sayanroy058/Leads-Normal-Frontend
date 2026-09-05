import "./RealEstateTeams.css";

import dashboardImage from "../assets/features/BuiltForTeamsDashboard.png";
import propertyImage from "../assets/features/BuiltForTeamsProperty.png";

function RealEstateTeams() {
  return (
    <section className="real-estate-teams-section" id="real-estate-teams">

      {/* Background decoration */}
      <div className="real-estate-teams-orb orb-one" />
      <div className="real-estate-teams-orb orb-two" />

      <div className="real-estate-teams-container">

        
        <div className="real-estate-teams-heading">

          <div className="real-estate-teams-eyebrow">
            <span className="teams-home-icon">⌂</span>
            <span>BUILT FOR REAL ESTATE TEAMS</span>
          </div>

          <h2>
            One Platform. Every{" "}
            <span>Real Estate</span> Role.
          </h2>

          <p>
            GradLead brings your leads, agents, and opportunities together
            so every team can focus on what matters — closing more deals.
          </p>

        </div>


        {/* =====================================================
            MAIN VISUAL
        ===================================================== */}
        <div className="real-estate-teams-main">

          {/* LEFT IMAGE */}
          <div className="teams-image-block teams-image-left">

            <div className="teams-image">
              <img
                src={propertyImage}
                alt="Real estate property management"
              />

              <div className="teams-image-overlay" />
            </div>

            <div className="teams-floating-card">

              <div className="teams-card-number">
                01
              </div>

              <div>
                <h3>Real Estate Operations</h3>

                <p>
                  Manage properties, leads and opportunities
                  from one intelligent workspace.
                </p>
              </div>

            </div>

          </div>


          {/* CENTER */}
          <div className="teams-center">

            <div className="teams-center-ring">

              <div className="teams-center-ring-small" />

              <div className="teams-center-card">

                <div className="teams-center-icon">
                  ✦
                </div>

                <h3>
                  One Intelligent
                  <br />
                  Workspace
                </h3>

                <p>
                  Every lead.
                  <br />
                  Every opportunity.
                </p>

              </div>

            </div>

          </div>


          {/* RIGHT IMAGE */}
          <div className="teams-image-block teams-image-right">

            <div className="teams-image">
              <img
                src={dashboardImage}
                alt="GradLead real estate dashboard"
              />

              <div className="teams-image-overlay" />
            </div>

            <div className="teams-floating-card">

              <div className="teams-card-number">
                02
              </div>

              <div>
                <h3>Sales & Lead Teams</h3>

                <p>
                  Prioritize high-intent opportunities
                  and close deals faster with AI insights.
                </p>
              </div>

            </div>

          </div>

        </div>


      


      
        <div className="real-estate-teams-result">

          <div className="result-icon">
            ✦
          </div>

          <p>
            Different roles. One goal:
            <strong>
              {" "}More qualified leads. More conversations.
              More closed deals.
            </strong>
          </p>

        </div>

      </div>

    </section>
  );
}

export default RealEstateTeams;