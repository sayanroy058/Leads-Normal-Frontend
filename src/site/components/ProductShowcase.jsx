import { useEffect, useRef, useState } from "react";
import "./ProductShowcase.css";

import dashboardImg from "../assets/gradelead-dashboard.png";
import aiChatImg from "../assets/gradelead-ai-chat.png";
import qualifyImg from "../assets/features/qualify.png";

const SHOWCASE_ITEMS = [
  {
   
    label: "AI-POWERED INTELLIGENCE",
    title: "Know which leads are ready to buy",
    description:
      "GradLead analyzes lead behavior, engagement, and intent signals to identify the prospects that matter most. Your team always knows where to focus next.",
    points: [
      "Real-time lead intelligence",
      "AI-powered intent detection",
      "Automatic lead prioritization",
    ],
    image: dashboardImg,
    imageAlt: "GradLead AI-powered lead intelligence dashboard",
  },
  {
   
    label: "PERSONALIZED ENGAGEMENT",
    title: "Every lead gets the right message",
    description:
      "GradLead uses AI to understand each prospect and help your team create personalized conversations that feel relevant instead of automated.",
    points: [
      "AI-generated personalized messages",
      "Context-aware conversations",
      "Faster lead response",
    ],
    image: aiChatImg,
    imageAlt: "GradLead AI chat and personalized engagement",
  },
  {
    
    label: "SMART LEAD SCORING",
    title: "Turn activity into actionable signals",
    description:
      "From browsing behavior to engagement patterns, GradLead turns activity into clear signals so your sales team can act before opportunities go cold.",
    points: [
      "Dynamic lead scoring",
      "Buying-intent signals",
      "Hot, warm and cold lead identification",
    ],
    image: qualifyImg,
    imageAlt: "GradLead lead qualification and scoring",
  },
];

function ProductShowcase() {
  const sectionRef = useRef(null);
  const [visibleItems, setVisibleItems] = useState([]);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const items = section.querySelectorAll(".showcase-item");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const index = Number(entry.target.dataset.index);

          setVisibleItems((previous) => {
            if (previous.includes(index)) {
              return previous;
            }

            return [...previous, index];
          });

          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -60px 0px",
      }
    );

    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="product-showcase">
      <div className="product-showcase-container">

        {/* HEADER */}
        <div className="product-showcase-header">
          <span className="product-showcase-eyebrow">
            INTELLIGENT LEAD MANAGEMENT
          </span>

          <h2>
            Everything your team needs
            <br />
            to turn leads into customers
          </h2>

          <p>
            GradLead combines AI intelligence, personalized engagement,
            and smart lead signals into one powerful workspace.
          </p>
        </div>

        {/* SHOWCASE LIST */}
        <div className="showcase-list">
          {SHOWCASE_ITEMS.map((item, index) => {
            const isVisible = visibleItems.includes(index);

            return (
              <article
                key={item.number}
                data-index={index}
                className={`showcase-item ${
                  index % 2 !== 0 ? "showcase-item-reverse" : ""
                } ${isVisible ? "showcase-item-visible" : ""}`}
              >

                {/* TEXT */}
                <div className="showcase-content">
                  <div className="showcase-number">
                    {item.number}
                  </div>

                  <span className="showcase-label">
                    {item.label}
                  </span>

                  <h3>{item.title}</h3>

                  <p className="showcase-description">
                    {item.description}
                  </p>

                  <ul className="showcase-points">
                    {item.points.map((point) => (
                      <li key={point}>
                        <span className="showcase-check">
                          ✓
                        </span>

                        <span className="showcase-point-text">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* VISUAL */}
                <div className="showcase-visual">
                  <div className="showcase-orb showcase-orb-one" />
                  <div className="showcase-orb showcase-orb-two" />

                  <div className="showcase-glow" />

                  <div className="showcase-image-wrapper">
                    <div className="showcase-image-shine" />

                    <img
                      src={item.image}
                      alt={item.imageAlt}
                      className="showcase-image"
                    />
                  </div>
                </div>

              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default ProductShowcase;