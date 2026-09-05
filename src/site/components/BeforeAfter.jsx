import { useEffect, useRef, useState } from "react";
import "./BeforeAfter.css";



const BEFORE_ROWS = [
  [
    "Unstructured Data",
    "Scattered Leads",
    "Manual Qualification",
    "Generic Outreach",
    "Undefined Priorities",
    "Missed Follow-ups",
  ],
  [
    "Disconnected Tools",
    "Slow Responses",
    "Limited Visibility",
    "Manual Processes",
    "Lost Context",
    "Unclear Pipeline",
  ],
];

const AFTER_ROWS = [
  [
    "Structured Data",
    "Unified Leads",
    "AI Qualification",
    "Personalized Outreach",
    "Smart Prioritization",
    "Automated Follow-ups",
  ],
  [
    "Connected Workspace",
    "Instant Responses",
    "Real-time Visibility",
    "Automated Workflows",
    "Complete Context",
    "Clear Pipeline",
  ],
];



function Card({ text, index }) {
  return (
    <div className="ba-card">
      <div className="ba-card-icon">
        {index % 2 === 0 ? "×" : "!"}
      </div>

      <span>{text}</span>
    </div>
  );
}


function Track({ items }) {
  const repeatedItems = [
    ...items,
    ...items,
    ...items,
    ...items,
  ];

  return (
    <div className="ba-track">
      {repeatedItems.map((text, index) => (
        <Card
          key={`${text}-${index}`}
          text={text}
          index={index}
        />
      ))}
    </div>
  );
}



export default function BeforeAfter() {
  const wrapperRef = useRef(null);
  const draggingRef = useRef(false);

  const [dividerPosition, setDividerPosition] = useState(50);

  const updateDivider = (clientX) => {
    if (!wrapperRef.current) return;

    const rect = wrapperRef.current.getBoundingClientRect();

    let position =
      ((clientX - rect.left) / rect.width) * 100;

    position = Math.max(5, Math.min(95, position));

    setDividerPosition(position);
  };

  const handlePointerDown = (event) => {
    event.preventDefault();

    draggingRef.current = true;

    updateDivider(event.clientX);

    if (event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  useEffect(() => {
    const handlePointerMove = (event) => {
      if (!draggingRef.current) return;

      updateDivider(event.clientX);
    };

    const handlePointerUp = () => {
      draggingRef.current = false;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      window.removeEventListener(
        "pointerup",
        handlePointerUp
      );
    };
  }, []);

  return (
    <section className="before-after-section">

      <div className="before-after-heading">
        <h2>
          From scattered leads to{" "}
          <span>intelligent growth</span>
        </h2>
      </div>

      <div
        ref={wrapperRef}
        className="ba-stage-wrapper"
      >

        {/* BEFORE / AFTER BUTTON */}

        <div
          className="ba-connected-control"
          style={{
            left: `${dividerPosition}%`,
          }}
          onPointerDown={handlePointerDown}
        >
          <div className="ba-connected-label ba-connected-before">
            Before
          </div>

          <div className="ba-connected-arrow">
            ↔
          </div>

          <div className="ba-connected-label ba-connected-after">
            After
          </div>
        </div>

        {/* MAIN STAGE */}

        <div
          className="ba-stage"
          style={{
            "--divider-position": `${dividerPosition}%`,
          }}
        >


          <div className="ba-left-background" />

          <div className="ba-right-background" />

          

          <div className="ba-moving-layer ba-grey-layer">

            <div className="ba-row ba-row-1">
              <Track items={BEFORE_ROWS[0]} />
            </div>

            <div className="ba-row ba-row-2">
              <Track items={BEFORE_ROWS[1]} />
            </div>

          </div>

          

          <div className="ba-moving-layer ba-blue-layer">

            <div className="ba-row ba-row-1">
              <Track items={AFTER_ROWS[0]} />
            </div>

            <div className="ba-row ba-row-2">
              <Track items={AFTER_ROWS[1]} />
            </div>

          </div>

     

          <div
            className="ba-divider"
            style={{
              left: `${dividerPosition}%`,
            }}
            onPointerDown={handlePointerDown}
          >

            <div className="ba-divider-line" />

            <div className="ba-divider-handle">
              ↔
            </div>

            <div className="ba-divider-dot" />

          </div>

        </div>

      </div>

      {/* BOTTOM CONTENT */}

      <div className="ba-bottom">

        <h3>
          One workspace.
          <br />
          Smarter lead management.
        </h3>

        <p>
          GradLead brings your leads, AI qualification,
          personalization and follow-ups together in one
          intelligent workspace.
        </p>

      </div>

    </section>
  );
}