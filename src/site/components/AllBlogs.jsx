import "./Blogs.css";
import { Link } from "@/site/router";

import Footer from "./Footer";

import automationImage from "../assets/features/blog-automation.png";
import qualificationImage from "../assets/features/blog-qualification.png";
import followupImage from "../assets/features/blog-followup.png";
import analyticsImage from "../assets/features/blog-analytics.png";

import highIntentImage from "../assets/features/blog-high-intent-leads.png";
import salesAutomationImage from "../assets/features/blog-sales-automation.png";
import fastResponseImage from "../assets/features/blog-fast-lead-response.png";
import pipelineAnalyticsImage from "../assets/features/blog-pipeline-analytics.png";

const blogs = [
  {
    id: 1,
    slug: "why-more-leads-dont-always-mean-more-revenue",
    image: automationImage,
    eyebrow: "SMARTER SALES GROWTH",
    title: "Why More Leads Don't Always Mean More Revenue",
    description:
      "Generating more leads is only the beginning. Discover how better targeting, accurate data, and high-intent signals help sales teams focus on opportunities that are more likely to convert.",
    readTime: "8 Mins Read",
  },

  {
    id: 2,
    slug: "how-ai-helps-sales-teams-find-high-intent-leads",
    image: qualificationImage,
    eyebrow: "FIND YOUR BEST-FIT PROSPECTS",
    title: "How AI Helps Sales Teams Find High-Intent Leads Faster",
    description:
      "Learn how AI can help sales teams identify the right prospects, analyze buyer signals, and focus their time on opportunities with stronger conversion potential.",
    readTime: "6 Mins Read",
  },

  {
    id: 3,
    slug: "why-clean-lead-data-drives-better-sales-results",
    image: followupImage,
    eyebrow: "TURN DATA INTO OPPORTUNITY",
    title: "Why Clean and Enriched Lead Data Drives Better Sales Results",
    description:
      "Better sales decisions start with better data. Discover why accurate, enriched, and up-to-date lead information helps teams improve targeting and pipeline performance.",
    readTime: "7 Mins Read",
  },

  {
    id: 4,
    slug: "from-prospecting-to-pipeline",
    image: analyticsImage,
    eyebrow: "BUILD A SMARTER PIPELINE",
    title: "From Prospecting to Pipeline: A Smarter Way to Grow Revenue",
    description:
      "Explore a more structured approach to prospecting that helps sales teams move qualified opportunities through the pipeline with greater confidence.",
    readTime: "9 Mins Read",
  },

  {
    id: 5,
    slug: "how-to-identify-high-intent-buyers",
    image: highIntentImage,
    eyebrow: "BUYER INTENT",
    title: "How to Identify High-Intent Buyers Before Your Competitors",
    description:
      "Discover how buyer intent signals can help your sales team identify prospects who are actively researching solutions and ready for meaningful conversations.",
    readTime: "7 Mins Read",
  },

  {
    id: 6,
    slug: "sales-automation-without-losing-personalization",
    image: salesAutomationImage,
    eyebrow: "SMART AUTOMATION",
    title: "How to Scale Sales Automation Without Losing Personalization",
    description:
      "Learn how sales teams can use automation to increase efficiency while keeping outreach relevant, personalized, and focused on the buyer.",
    readTime: "8 Mins Read",
  },

  {
    id: 7,
    slug: "why-fast-lead-response-wins-more-deals",
    image: fastResponseImage,
    eyebrow: "FASTER EXECUTION",
    title: "Why Faster Lead Response Can Win More Deals",
    description:
      "Speed matters when prospects show interest. Learn why faster response times can improve engagement and help sales teams capture opportunities.",
    readTime: "6 Mins Read",
  },

  {
    id: 8,
    slug: "how-pipeline-analytics-improve-revenue",
    image: pipelineAnalyticsImage,
    eyebrow: "REVENUE INTELLIGENCE",
    title: "How Pipeline Analytics Helps Teams Make Better Revenue Decisions",
    description:
      "Pipeline analytics helps revenue teams understand performance, identify risks, and make better decisions using clear and actionable sales data.",
    readTime: "9 Mins Read",
  },
];

export default function AllBlogs() {
  return (
    <>

      <section className="blogs all-blogs-page">
        <div className="blogs-container">

          <div className="blogs-heading all-blogs-heading">
            <span className="blogs-eyebrow">
              INSIGHTS & RESOURCES
            </span>

            <h2>Latest Insights</h2>

            <p>
              Explore practical strategies, sales insights, and resources
              designed to help your team find better leads, improve execution,
              and build a stronger revenue pipeline.
            </p>
          </div>

          <div className="blogs-grid all-blogs-grid">
            {blogs.map((blog) => (
              <article
                className="small-blog-card"
                key={blog.id}
              >
                <div className="small-blog-image">
                  <img
                    src={blog.image}
                    alt={blog.title}
                  />
                </div>

                <div className="small-blog-content">
                  <span className="small-blog-eyebrow">
                    {blog.eyebrow}
                  </span>

                  <h3>{blog.title}</h3>

                  <p className="all-blog-description">
                    {blog.description}
                  </p>

                  <div className="small-blog-footer">
                    <span className="blog-read-time">
                      <span className="clock-icon">
                        ◷
                      </span>

                      {blog.readTime}
                    </span>

                    <Link
                      to={`/blog/${blog.slug}`}
                      className="small-read-more"
                      onClick={() => window.scrollTo(0, 0)}
                    >
                      Read More

                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="blogs-bottom">
            <Link
              to="/#blogs"
              className="view-more-btn"
              onClick={() => {
                setTimeout(() => {
                  document
                    .getElementById("blogs")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }, 100);
              }}
            >
              ← Back to Blogs
            </Link>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}