import { useState, useEffect } from "react";
import { Link } from "@/site/router";
import "./Hero.css";

import dashboardImage from "../assets/gradelead-dashboard.png";
import aiChatImage from "../assets/gradelead-ai-chat.png";

const ROTATING_WORDS = [
  "Closed Deal",
  "Booked Meeting",
  "Loyal Customer",
  "Pipeline Win",
];

function Hero() {
  const [wordIndex, setWordIndex] = useState(0);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    let swapTimeout;

    const interval = setInterval(() => {
      setIsSwitching(true);

      swapTimeout = setTimeout(() => {
        setWordIndex(
          (prev) => (prev + 1) % ROTATING_WORDS.length
        );

        setIsSwitching(false);
      }, 350);
    }, 2400);

    return () => {
      clearInterval(interval);
      clearTimeout(swapTimeout);
    };
  }, []);

  return (
    <section className="hero">
      {/* Background grid */}
      <div className="hero-grid" />

      {/* Background glows */}
      <div className="hero-glow hero-glow-one" />
      <div className="hero-glow hero-glow-two" />

      {/* Main hero content */}
      <div className="hero-container">

        {/* Badge */}
        <div className="hero-badge">
          <span className="badge-sparkle">✦</span>
          <span>AI-POWERED LEAD MANAGEMENT</span>
        </div>

        {/* Main heading */}
        <h1>
          Turn Every Lead Into
          <br />
          a{" "}
          <span
            className={
              "rotating-word" +
              (isSwitching ? " rotating-word-exit" : "")
            }
          >
            {ROTATING_WORDS[wordIndex]}
          </span>
        </h1>

        {/* Description */}
        <p className="hero-description">
          Capture, qualify and convert leads with AI-powered automation —
          so no opportunity sits in your inbox untouched.
        </p>

        {/* Buttons */}
        <div className="hero-buttons">
          <Link
            to="/get-started"
            className="primary-btn"
          >
            <span>Get Started</span>
            <span>→</span>
          </Link>

          <Link
            to="/features"
            className="secondary-btn"
          >
            <span className="play-icon">▶</span>
            <span>Explore GradLead</span>
          </Link>
        </div>
        
        {/* Product visual */}
        <div className="hero-visual">
          <div className="image-glow" />

          {/* Dashboard image */}
          <img
            className="dashboard-shot"
            src={dashboardImage}
            alt="GradLead Dashboard"
          />

          {/* AI Chat floating card */}
          <div className="chat-floating">
            <img
              src={aiChatImage}
              alt="GradLead AI Chat"
            />
          </div>

          {/* Decorative elements */}
          <div className="floating-dot dot-one" />
          <div className="floating-dot dot-two" />
          <div className="floating-ring ring-one" />
        </div>
      </div>
    </section>
  );
}

export default Hero;