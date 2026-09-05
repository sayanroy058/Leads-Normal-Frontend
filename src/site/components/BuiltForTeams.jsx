import "./BuiltForTeams.css";
import {
  Building2,
  Rocket,
  TrendingUp,
  Handshake,
  Home,
  BriefcaseBusiness,
} from "lucide-react";

const TEAMS = [
  {
    icon: Building2,
    title: "Real Estate Teams",
    text: "Manage and convert property leads faster.",
  },
  {
    icon: Rocket,
    title: "Startups",
    text: "Build a scalable lead-to-customer pipeline.",
  },
  {
    icon: TrendingUp,
    title: "Growth Teams",
    text: "Turn more opportunities into measurable growth.",
  },
  {
    icon: Handshake,
    title: "Sales Agencies",
    text: "Manage multiple clients and leads effortlessly.",
  },
  {
    icon: Home,
    title: "Property Teams",
    text: "Keep every property enquiry organized and active.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Revenue Teams",
    text: "Connect lead intelligence with revenue outcomes.",
  },
];

function BuiltForTeams() {
  return (
    <section className="built-section">
      <div className="built-container">

        {/* Background decoration */}
        <div className="built-glow built-glow-one" />
        <div className="built-glow built-glow-two" />

        {/* Heading */}
        <div className="built-heading">
          <span className="built-eyebrow">
            BUILT FOR MODERN TEAMS
          </span>

          <h2>
            Built for teams that
            <span> never lose a lead.</span>
          </h2>

          <p>
            From real estate teams to fast-growing businesses,
            GradLead helps every team turn more leads into
            meaningful opportunities.
          </p>
        </div>

        {/* Team cards */}
        <div className="built-grid">
          {TEAMS.map((team, index) => {
            const Icon = team.icon;

            return (
              <div
                className="built-card"
                key={team.title}
                style={{
                  "--delay": `${index * 0.08}s`,
                }}
              >
                <div className="built-icon">
                  <Icon size={23} strokeWidth={1.8} />
                </div>

                <div className="built-card-content">
                  <h3>{team.title}</h3>

                  <p>{team.text}</p>
                </div>

                <div className="built-arrow">
                  →
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom statement */}
        <div className="built-bottom">
          <span className="built-line" />

          <p>
            One intelligent workspace.
            <strong> Every lead connected.</strong>
          </p>

          <span className="built-line" />
        </div>

      </div>
    </section>
  );
}

export default BuiltForTeams;