import { useEffect, useRef, useState } from "react";
import "./LeadJourney.css";

import captureImage from "../assets/features/CaptureLead.png";
import understandImage from "../assets/features/UnderstandLead.png";
import qualifyImage from "../assets/features/QualifyLead.png";
import engageImage from "../assets/features/EngageLead.png";

const JOURNEY_STEPS = [
  {
    number: "01",
    title: "Capture",
    subtitle: "Bring every lead into one place",
    description:
      "Capture property inquiries from every channel and keep every opportunity organized in one intelligent workspace.",
    image: captureImage,
  },
  {
    number: "02",
    title: "Understand",
    subtitle: "Know what every lead needs",
    description:
      "AI understands buyer intent, preferences and context so your team can see the real opportunity behind every inquiry.",
    image: understandImage,
  },
  {
    number: "03",
    title: "Qualify",
    subtitle: "Focus on high-intent prospects",
    description:
      "Automatically identify the leads most likely to convert and prioritize them for faster, smarter follow-up.",
    image: qualifyImage,
  },
  {
    number: "04",
    title: "Engage",
    subtitle: "Start the right conversation",
    description:
      "Create personalized outreach based on each lead's behavior, interests and stage in the buying journey.",
    image: engageImage,
  },
];

export default function LeadJourney() {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const cards = section.querySelectorAll(".journey-step");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("journey-visible");
          }
        });
      },
      { threshold: 0.18 }
    );

    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="lead-journey" ref={sectionRef} id="lead-journey">
      <div className="journey-bg-orb journey-bg-orb-one" />
      <div className="journey-bg-orb journey-bg-orb-two" />

      <div className="journey-container">
        <div className="journey-heading">
          <span className="journey-eyebrow">
            <i />
            HOW GRADLEAD WORKS
          </span>

          <h2>
            From First Inquiry
            <br />
            <span>To Real Opportunity.</span>
          </h2>

          <p>
            Every lead moves through a smarter journey — from the moment they
            arrive to the moment they are ready to convert.
          </p>
        </div>

        <div className="journey-line">
          <div
            className="journey-line-progress"
            style={{
              width: `${(activeStep / (JOURNEY_STEPS.length - 1)) * 100}%`,
            }}
          />
        </div>

        <div className="journey-steps">
          {JOURNEY_STEPS.map((step, index) => (
            <article
              key={step.number}
              className={`journey-step ${
                activeStep === index ? "journey-active" : ""
              }`}
              onMouseEnter={() => setActiveStep(index)}
              onFocus={() => setActiveStep(index)}
              tabIndex={0}
            >
              <div className="journey-step-top">
                <div className="journey-number">{step.number}</div>
                <div className="journey-connector" />
              </div>

              <div className="journey-card">
                <div className="journey-card-content">
                  <span className="journey-mini-label">LEAD STAGE</span>

                  <h3>{step.title}</h3>

                  <h4>{step.subtitle}</h4>

                  <p>{step.description}</p>

                  <div className="journey-card-arrow">↗</div>
                </div>

                <div className="journey-image-wrap">
                  <img src={step.image} alt={`${step.title} lead workflow`} />
                  <div className="journey-image-shine" />
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="journey-result">
          <span className="journey-result-dot" />
          <strong>One intelligent journey.</strong>
          <span>Every lead gets the right next step.</span>
        </div>
      </div>
    </section>
  );
}
