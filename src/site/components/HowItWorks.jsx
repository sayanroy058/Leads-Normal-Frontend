"use client";

import "./HowItWorks.css";

import captureimg from "../assets/features/capture.png";
import qualifyimg from "../assets/features/qualify.png";
import engageimg from "../assets/features/engage.png";

const STEPS = [
  {
    id: 1,
    label: "Capture",
    caption: "Capture every lead automatically from every channel.",
    img: captureimg,
  },
  {
    id: 2,
    label: "Qualify",
    caption: "AI analyzes intent, behavior and lead quality instantly.",
    img: qualifyimg,
  },
  {
    id: 3,
    label: "Engage",
    caption: "Turn qualified leads into conversations with AI.",
    img: engageimg,
  },
];

function HowItWorks() {
  return (
    <section className="hiw-section">
      <div className="hiw-container">

        
        <div className="hiw-stack">

          {/* Glow */}
          <div className="hiw-stack-glow" />

          {/* Vertical connecting line */}
          <div className="hiw-stack-line" />

          {STEPS.map((step, index) => (
            <div
              className={`hiw-layer hiw-layer-${index}`}
              key={step.id}
            >

              {/* Number */}
              <div className="hiw-layer-number">
                {String(step.id).padStart(2, "0")}
              </div>

              {/* Layer */}
              <div className="hiw-layer-card">

                <div className="hiw-layer-content">

                  <div className="hiw-layer-text">
                    <span className="hiw-layer-small">
                      STEP {String(step.id).padStart(2, "0")}
                    </span>

                    <h3>{step.label}</h3>

                    <p>{step.caption}</p>
                  </div>

                  <div className="hiw-layer-image">
                    <div className="hiw-layer-browser">

                      <div className="hiw-layer-browser-bar">
                        <span />
                        <span />
                        <span />
                      </div>

                      <img
                        src={step.img}
                        alt={step.label}
                      />

                    </div>
                  </div>

                </div>

              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default HowItWorks;