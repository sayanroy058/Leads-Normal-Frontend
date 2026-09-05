import "./BlogsPage.css";
import { Link } from "@/site/router";

import automationImage from "../assets/features/blog-automation.png";
import qualificationImage from "../assets/features/blog-qualification.png";
import followupImage from "../assets/features/blog-followup.png";
import analyticsImage from "../assets/features/blog-analytics.png";
import highIntentImage from "../assets/features/blog-high-intent-leads.png";
import salesAutomationImage from "../assets/features/blog-sales-automation.png";
import fastResponseImage from "../assets/features/blog-fast-lead-response.png";
import pipelineAnalyticsImage from "../assets/features/blog-pipeline-analytics.png";

import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";

const blogs = [
  {
    id: 1,
    slug: "why-more-leads-dont-always-mean-more-revenue",
    image: automationImage,
    eyebrow: "SMARTER SALES GROWTH",
    title: "Why More Leads Don't Always Mean More Revenue",
    description:
      "Discover why generating more leads is not always the answer and how better qualification can improve your revenue pipeline.",
    readTime: "8 Mins Read",
  },
  {
    id: 2,
    slug: "how-ai-helps-sales-teams-find-high-intent-leads",
    image: qualificationImage,
    eyebrow: "FIND YOUR BEST-FIT PROSPECTS",
    title: "How AI Helps Sales Teams Find High-Intent Leads Faster",
    description:
      "Learn how AI helps sales teams identify stronger buying signals and prioritize the prospects most likely to convert.",
    readTime: "6 Mins Read",
  },
  {
    id: 3,
    slug: "why-clean-lead-data-drives-better-sales-results",
    image: followupImage,
    eyebrow: "TURN DATA INTO OPPORTUNITY",
    title: "Why Clean and Enriched Lead Data Drives Better Sales Results",
    description:
      "Explore how accurate, enriched and reliable lead data helps teams make smarter sales decisions.",
    readTime: "7 Mins Read",
  },
  {
    id: 4,
    slug: "from-prospecting-to-pipeline",
    image: analyticsImage,
    eyebrow: "BUILD A SMARTER PIPELINE",
    title: "From Prospecting to Pipeline: A Smarter Way to Grow Revenue",
    description:
      "See how connected prospecting, qualification and follow-up create a healthier revenue pipeline.",
    readTime: "9 Mins Read",
  },
 {
  id: 5,
  slug: "how-to-prioritize-high-intent-leads",
  image: highIntentImage,
  eyebrow: "SMARTER LEAD PRIORITIZATION",
  title: "How to Prioritize High-Intent Leads Before Your Competitors",
  description:
    "Focus your sales team's time on prospects showing meaningful buying intent instead of treating every lead equally.",
  readTime: "7 Mins Read",
},
{
  id: 6,
  slug: "sales-automation-for-modern-teams",
  image: salesAutomationImage,
  eyebrow: "AUTOMATE THE RIGHT WORK",
  title: "How Sales Automation Helps Modern Teams Move Faster",
  description:
    "Discover which repetitive tasks sales automation can remove so representatives can spend more time selling.",
  readTime: "8 Mins Read",
},
{
  id: 7,
  slug: "reduce-lead-response-time",
  image: fastResponseImage,
  eyebrow: "FASTER FOLLOW-UP",
  title: "Why Faster Lead Response Creates Better Conversion Opportunities",
  description:
    "Understand why speed matters and how structured follow-up workflows can improve sales conversion rates.",
  readTime: "6 Mins Read",
},
{
  id: 8,
  slug: "sales-pipeline-analytics",
  image: pipelineAnalyticsImage,
  eyebrow: "PIPELINE INTELLIGENCE",
  title: "How Better Sales Analytics Improve Revenue Decisions",
  description:
    "Turn pipeline data into practical insights that help teams identify risks, opportunities and growth patterns.",
  readTime: "9 Mins Read",
},
];

export default function BlogsPage() {
  return (
     <>
    <Navbar />
    <section className="all-blogs-page">
      <div className="all-blogs-container">
        <div className="all-blogs-heading">
          <span>INSIGHTS & RESOURCES</span>

          <h1>Explore Our Blogs</h1>

          <p>
            Practical insights, strategies and resources to help your team
            generate better leads, improve prospecting and build a stronger
            sales pipeline.
          </p>
        </div>

        <div className="all-blogs-grid">
          {blogs.map((blog) => (
            <article className="all-blog-card" key={blog.id}>
              <div className="all-blog-image">
                <img src={blog.image} alt={blog.title} />
              </div>

              <div className="all-blog-content">
                <span className="all-blog-eyebrow">
                  {blog.eyebrow}
                </span>

                <h2>{blog.title}</h2>

                <p>{blog.description}</p>

                <div className="all-blog-footer">
                  <span>
                    <span className="clock-icon">◷</span>
                    {blog.readTime}
                  </span>

                  <Link
                    to={`/blog/${blog.slug}`}
                    className="all-read-more"
                  >
                    Read More <span>→</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
    <Footer />
  </>
  );
}