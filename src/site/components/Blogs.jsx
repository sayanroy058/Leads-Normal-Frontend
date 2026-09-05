import "./Blogs.css";
import { Link } from "@/site/router";

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
    featured: true,
  },

  {
    id: 2,
    slug: "how-ai-helps-sales-teams-find-high-intent-leads",
    image: qualificationImage,
    eyebrow: "FIND YOUR BEST-FIT PROSPECTS",
    title: "How AI Helps Sales Teams Find High-Intent Leads Faster",
    readTime: "6 Mins Read",
  },

  {
    id: 3,
    slug: "why-clean-lead-data-drives-better-sales-results",
    image: followupImage,
    eyebrow: "TURN DATA INTO OPPORTUNITY",
    title: "Why Clean and Enriched Lead Data Drives Better Sales Results",
    readTime: "7 Mins Read",
  },

  {
    id: 4,
    slug: "from-prospecting-to-pipeline",
    image: analyticsImage,
    eyebrow: "BUILD A SMARTER PIPELINE",
    title: "From Prospecting to Pipeline: A Smarter Way to Grow Revenue",
    readTime: "9 Mins Read",
  },

  {
    id: 5,
    slug: "how-to-identify-high-intent-buyers",
    image: highIntentImage,
    eyebrow: "BUYER INTENT",
    title: "How to Identify High-Intent Buyers Before Your Competitors",
    readTime: "7 Mins Read",
  },

  {
    id: 6,
    slug: "sales-automation-without-losing-personalization",
    image: salesAutomationImage,
    eyebrow: "SMART AUTOMATION",
    title: "How to Scale Sales Automation Without Losing Personalization",
    readTime: "8 Mins Read",
  },

  {
    id: 7,
    slug: "why-fast-lead-response-wins-more-deals",
    image: fastResponseImage,
    eyebrow: "FASTER EXECUTION",
    title: "Why Faster Lead Response Can Win More Deals",
    readTime: "6 Mins Read",
  },

  {
    id: 8,
    slug: "how-pipeline-analytics-improve-revenue",
    image: pipelineAnalyticsImage,
    eyebrow: "REVENUE INTELLIGENCE",
    title: "How Pipeline Analytics Helps Teams Make Better Revenue Decisions",
    readTime: "9 Mins Read",
  },
];

export default function Blogs() {
  const featuredBlog = blogs.find((blog) => blog.featured);

  // Homepage par first 3 normal cards
  const smallBlogs = blogs
    .filter((blog) => !blog.featured)
    .slice(0,3);

  return (
    <section className="blogs" id="blogs">
      <div className="blogs-container">
        {/* HEADING */}

        <div className="blogs-heading">
          <span className="blogs-eyebrow">
            INSIGHTS & RESOURCES
          </span>

          <h2>Blogs</h2>

          <p>
            Practical insights to help your team find better leads,
            improve prospecting, and build a stronger sales pipeline.
          </p>
        </div>

        {/* FEATURED BLOG */}

        <article className="featured-blog-card">
          <div className="featured-blog-image">
            <div className="featured-image-glow"></div>

            <img
              src={featuredBlog.image}
              alt={featuredBlog.title}
              className="featured-blog-illustration"
            />
          </div>

          <div className="featured-blog-content">
            <span className="blog-eyebrow">
              {featuredBlog.eyebrow}
            </span>

            <h3>
              {featuredBlog.title}
            </h3>

            <p>
              {featuredBlog.description}
            </p>

            <div className="blog-footer">
              <span className="blog-read-time">
                <span className="clock-icon">
                  ◷
                </span>

                {featuredBlog.readTime}
              </span>

              <Link
                to={`/blog/${featuredBlog.slug}`}
                className="read-more"
                onClick={() => window.scrollTo(0, 0)}
              >
                Read More

                <span>
                  →
                </span>
              </Link>
            </div>
          </div>
        </article>

        {/* HOMEPAGE SMALL BLOGS */}

        <div className="blogs-grid">
          {smallBlogs.map((blog) => (
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

                <h3>
                  {blog.title}
                </h3>

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

                    <span>
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* VIEW MORE */}

        <div className="blogs-bottom">
          <Link
            to="/blogs"
            className="view-more-btn"
            onClick={() => window.scrollTo(0, 0)}
          >
            View More

            <span>
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}