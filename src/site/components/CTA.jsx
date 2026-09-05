import "./CTA.css";

export default function CTA() {
  return (
    <section className="cta-section">
      <div className="cta-content">
       <h2 className="cta-animated-heading">
         You have scrolled so far, don't stop now!
        <br />
        Start building a stronger pipeline today.
       </h2>

        <p>
          Find better leads, focus on the right opportunities, and turn your
          sales process into predictable growth.
        </p>

        <a href="#contact" className="cta-button">
          Get Started
          <span>→</span>
        </a>
      </div>
    </section>
  );
}