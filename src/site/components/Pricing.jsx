import { useState } from "react";
import "./Pricing.css";
import Footer from "./Footer.jsx";

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";


const WEB3FORMS_ACCESS_KEY =
  "f6756048-673c-49f2-98fd-9e949189bd10";

export default function Pricing() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const data = {
      access_key: WEB3FORMS_ACCESS_KEY,

      name: formData.get("name")?.trim(),
      email: formData.get("email")?.trim(),
      company: formData.get("company")?.trim(),
      phone: formData.get("phone")?.trim(),
      requirement: formData.get("requirement"),
      message: formData.get("message")?.trim(),

      subject: "New GradLead Pricing Request",
      from_name: "GradLead AI Website",
    };

    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify(data),
      });

      
      const rawResponse = await response.text();

      let result = {};

      try {
        result = rawResponse ? JSON.parse(rawResponse) : {};
      } catch {
        result = {};
      }

      console.log("Web3Forms response:", result);

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.message ||
            `Unable to send your request. Server returned ${response.status}.`
        );
      }

      // SUCCESS
      setSubmitted(true);

      // Clear form
      form.reset();
    } catch (err) {
      console.error("Contact form error:", err);

      setError(
        err.message ||
          "Unable to send your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="pricing-page">

      
        <section className="pricing-hero">
          <div className="pricing-hero-glow pricing-glow-one"></div>
          <div className="pricing-hero-glow pricing-glow-two"></div>

          <div className="pricing-container">
            <div className="pricing-hero-content">

              <span className="pricing-eyebrow">
                TALK TO GRADLEAD
              </span>

              <h1>
                Let's build your
                <span> smarter sales engine.</span>
              </h1>

              <p>
                Tell us about your goals and we'll help you find
                the right GradLead solution for your business.
              </p>

              <div className="pricing-hero-points">
                <div className="pricing-hero-point">
                  <span>✓</span>
                  <p>AI-powered lead intelligence</p>
                </div>

                <div className="pricing-hero-point">
                  <span>✓</span>
                  <p>Automated lead qualification</p>
                </div>

                <div className="pricing-hero-point">
                  <span>✓</span>
                  <p>Smarter sales engagement</p>
                </div>
              </div>

            </div>
          </div>
        </section>


       
        <section className="pricing-contact">
          <div className="pricing-container">

            <div className="pricing-contact-grid">

              {/* LEFT SIDE */}
              <div className="pricing-contact-info">

                <span className="pricing-section-label">
                  GET STARTED
                </span>

                <h2>
                  Tell us what
                  <span> you need.</span>
                </h2>

                <p>
                  Share a few details about your business and
                  requirements. Our team will get back to you
                  with the right solution.
                </p>

                <div className="pricing-info-card">

                  <div className="pricing-info-icon">
                    ✦
                  </div>

                  <div>
                    <h3>Why GradLead?</h3>

                    <p>
                      Turn scattered lead data into structured,
                      actionable intelligence that helps your
                      sales team focus on the opportunities that
                      matter most.
                    </p>
                  </div>

                </div>

                <div className="pricing-mini-points">

                  <div className="pricing-mini-point">
                    <span>01</span>
                    <p>Understand your requirements</p>
                  </div>

                  <div className="pricing-mini-point">
                    <span>02</span>
                    <p>Recommend the right solution</p>
                  </div>

                  <div className="pricing-mini-point">
                    <span>03</span>
                    <p>Help you get started</p>
                  </div>

                </div>

              </div>


              {/* RIGHT SIDE - FORM */}
              <div className="pricing-form-wrapper">

                {!submitted ? (
                  <form
                    className="pricing-form"
                    onSubmit={handleSubmit}
                  >

                    <div className="pricing-form-header">
                      <span>CONTACT FORM</span>

                      <h3>
                        Let's connect.
                      </h3>

                      <p>
                        Fill in the details below and our team
                        will reach out to you.
                      </p>
                    </div>


                    {/* ERROR */}
                    {error && (
                      <div className="pricing-form-error">
                        <span>!</span>
                        <p>{error}</p>
                      </div>
                    )}


                    {/* NAME + EMAIL */}
                    <div className="pricing-form-row">

                      <div className="pricing-field">
                        <label htmlFor="name">
                          Full Name
                        </label>

                        <input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Your full name"
                          required
                          disabled={loading}
                        />
                      </div>


                      <div className="pricing-field">
                        <label htmlFor="email">
                          Work Email
                        </label>

                        <input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="you@company.com"
                          required
                          disabled={loading}
                        />
                      </div>

                    </div>


                    {/* COMPANY + PHONE */}
                    <div className="pricing-form-row">

                      <div className="pricing-field">
                        <label htmlFor="company">
                          Company
                        </label>

                        <input
                          id="company"
                          name="company"
                          type="text"
                          placeholder="Company name"
                          required
                          disabled={loading}
                        />
                      </div>


                      <div className="pricing-field">
                        <label htmlFor="phone">
                          Phone
                        </label>

                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="+91 XXXXX XXXXX"
                          disabled={loading}
                        />
                      </div>

                    </div>


                    {/* REQUIREMENT */}
                    <div className="pricing-field">

                      <label htmlFor="requirement">
                        What are you looking for?
                      </label>

                      <select
                        id="requirement"
                        name="requirement"
                        required
                        disabled={loading}
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Select an option
                        </option>

                        <option value="Lead Management">
                          Lead Management
                        </option>

                        <option value="AI Lead Qualification">
                          AI Lead Qualification
                        </option>

                        <option value="Sales Automation">
                          Sales Automation
                        </option>

                        <option value="Customer Engagement">
                          Customer Engagement
                        </option>

                        <option value="Custom Solution">
                          Custom Solution
                        </option>

                        <option value="Other">
                          Other
                        </option>
                      </select>

                    </div>


                    {/* MESSAGE */}
                    <div className="pricing-field">

                      <label htmlFor="message">
                        Tell us more
                      </label>

                      <textarea
                        id="message"
                        name="message"
                        rows="5"
                        placeholder="Tell us about your business, goals or requirements..."
                        required
                        disabled={loading}
                      ></textarea>

                    </div>


                    {/* SUBMIT */}
                    <button
                      type="submit"
                      className="pricing-submit-button"
                      disabled={loading}
                    >

                      {loading ? (
                        <>
                          <span className="pricing-spinner"></span>
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Request
                          <span>→</span>
                        </>
                      )}

                    </button>


                    <p className="pricing-form-note">
                      Your information is used only to respond
                      to your request.
                    </p>

                  </form>
                ) : (

                 
                  <div className="pricing-success">

                    <div className="pricing-success-icon">
                      ✓
                    </div>

                    <span className="pricing-success-label">
                      REQUEST RECEIVED
                    </span>

                    <h3>
                      Thanks for reaching out!
                    </h3>

                    <p>
                      Your request has been successfully sent.
                      Our team will review your requirements and
                      get back to you shortly.
                    </p>

                    <button
                      type="button"
                      className="pricing-success-button"
                      onClick={() => {
                        setSubmitted(false);
                        setError("");
                      }}
                    >
                      Send another request
                      <span>→</span>
                    </button>

                  </div>
                )}

              </div>

            </div>

          </div>
        </section>


     
        <section className="pricing-bottom-cta">

          <div className="pricing-container">

            <div className="pricing-bottom-content">

              <span className="pricing-section-label">
                GRADLEAD AI
              </span>

              <h2>
                Turn every lead into
                <span> an opportunity.</span>
              </h2>

              <p>
                Build a smarter, more efficient sales process
                with AI-powered lead intelligence.
              </p>

              <a
                href="/get-started"
                className="pricing-bottom-button"
              >
                Get Started
                <span>→</span>
              </a>

            </div>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}