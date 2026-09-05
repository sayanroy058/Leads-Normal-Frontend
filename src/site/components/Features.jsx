import { useEffect, useState } from "react";
import "./Features.css";

// Screenshot imports
import captureImg from "../assets/features/capture.png";
import qualifyImg from "../assets/features/qualify.png";
import engageImg from "../assets/features/engage.png";
import automateImg from "../assets/features/automate.png";
import convertImg from "../assets/features/convert.png";

const STAGES = [
  {
    key: "capture",
    tab: "Capture",
    title: "Capture leads from everywhere",
    description:
      "Pull leads in from your website, forms, ads, and inbox into one queue — nothing sits scattered across five tools.",
    points: [
      "Unified intake from web, ads, and email",
      "Auto-dedupe against existing contacts",
    ],
    image: captureImg,
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="url(#g1)"
          strokeWidth="2"
        />
        <path
          d="M16 24h16M24 16v16"
          stroke="url(#g1)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="48" y2="48">
            <stop stopColor="#2563eb" />
            <stop offset="1" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },

  {
    key: "qualify",
    tab: "Qualify",
    title: "Score every lead automatically",
    description:
      "AI reads firmographic and behavioral signals to rank leads by how likely they are to close — so reps work the right ones first.",
    points: [
      "Real-time lead scoring model",
      "Custom criteria for your ICP",
    ],
    image: qualifyImg,
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <path
          d="M24 8l4.5 9.2 10.1 1.5-7.3 7.1 1.7 10-9-4.7-9 4.7 1.7-10-7.3-7.1 10.1-1.5z"
          stroke="url(#g2)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="g2" x1="0" y1="0" x2="48" y2="48">
            <stop stopColor="#2563eb" />
            <stop offset="1" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },

  {
    key: "engage",
    tab: "Engage",
    title: "Reach out with the right message",
    description:
      "Every lead gets a message written around their role, industry, and where they are in the funnel — not a generic template.",
    points: [
      "AI-drafted, persona-aware messaging",
      "Send across email, LinkedIn, and phone",
    ],
    image: engageImg,
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <rect
          x="8"
          y="12"
          width="32"
          height="22"
          rx="4"
          stroke="url(#g3)"
          strokeWidth="2"
        />
        <path
          d="M8 16l16 11 16-11"
          stroke="url(#g3)"
          strokeWidth="2"
        />
        <defs>
          <linearGradient id="g3" x1="0" y1="0" x2="48" y2="48">
            <stop stopColor="#2563eb" />
            <stop offset="1" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },

  {
    key: "automate",
    tab: "Automate",
    title: "Run sequences on autopilot",
    description:
      "Follow-ups, reminders, and nudges go out on schedule without a rep touching a spreadsheet, so no lead goes cold.",
    points: [
      "Multi-step, multi-channel sequences",
      "Auto-pause when a lead replies",
    ],
    image: automateImg,
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <path
          d="M12 24a12 12 0 1122 7"
          stroke="url(#g4)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M34 31l4 3-1 5"
          stroke="url(#g4)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="g4" x1="0" y1="0" x2="48" y2="48">
            <stop stopColor="#2563eb" />
            <stop offset="1" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },

  {
    key: "convert",
    tab: "Convert",
    title: "Know which leads will close",
    description:
      "A prediction model flags accounts showing genuine buying intent, so your team spends time on deals that are actually winnable.",
    points: [
      "ML-based purchase-intent prediction",
      "Weekly pipeline health signals",
    ],
    image: convertImg,
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <path
          d="M10 34l8-10 7 6 13-16"
          stroke="url(#g5)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M30 14h8v8"
          stroke="url(#g5)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="g5" x1="0" y1="0" x2="48" y2="48">
            <stop stopColor="#2563eb" />
            <stop offset="1" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
];

function Features() {
  const [activeKey, setActiveKey] = useState(STAGES[0].key);

  // Automatically change feature every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveKey((currentKey) => {
        const currentIndex = STAGES.findIndex(
          (stage) => stage.key === currentKey
        );

        const nextIndex = (currentIndex + 1) % STAGES.length;

        return STAGES[nextIndex].key;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const active = STAGES.find((stage) => stage.key === activeKey);

  const activeIndex = STAGES.findIndex(
    (stage) => stage.key === activeKey
  );

  return (
    <section className="features">
      <div className="features-container">

        {/* HEADING */}
        <h2 className="features-heading">
          Close more deals with less manual work
        </h2>

        {/* TABS */}
        <div className="features-tabs" role="tablist">
          {STAGES.map((stage) => (
            <button
              key={stage.key}
              role="tab"
              aria-selected={stage.key === activeKey}
              className={
                "features-tab" +
                (stage.key === activeKey
                  ? " features-tab-active"
                  : "")
              }
              onClick={() => setActiveKey(stage.key)}
            >
              {stage.tab}
            </button>
          ))}
        </div>

        {/* CONTENT PANEL */}
        <div className="features-panel">

          {/* LEFT CONTENT */}
          <div className="features-copy" key={active.key}>

            <span className="features-step">
              0{activeIndex + 1} / 0{STAGES.length}
            </span>

            <div className="features-icon-badge">
              {active.icon}
            </div>

            <h3>{active.title}</h3>

            <p>{active.description}</p>

            <ul className="features-points">
              {active.points.map((point, index) => (
                <li key={point}>
                  <span className="point-index">
                    0{index + 1}
                  </span>

                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT IMAGE */}
          <div className="features-visual">
            <img
              key={active.key}
              src={active.image}
              alt={active.title}
              className="features-screenshot"
            />
          </div>

        </div>
      </div>
    </section>
  );
}

export default Features;