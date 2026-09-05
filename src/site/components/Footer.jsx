import { Link } from "@/site/router";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* =================================================
            FOOTER TOP
        ================================================= */}

        <div className="footer-top">

          {/* BRAND */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="footer-logo-text">
                Grad<span>Lead AI</span>
              </span>
            </Link>

            <p className="footer-description">
              Turn every opportunity into growth with
              intelligent lead management, AI-powered
              qualification, and smarter sales workflows.
            </p>

            
          </div>


          {/* =================================================
              FEATURES
          ================================================= */}

          <div className="footer-column">
            <h4>Features</h4>

            <Link to="/features/lead-inbox">
              Lead Capture
            </Link>

            <Link to="/features/qualification">
              Lead Intelligence
            </Link>

            <Link to="/features/lead-scoring">
              Lead Scoring
            </Link>

            <Link to="/features/prioritization">
              Lead Prioritization
            </Link>

            <Link to="/features/messaging">
              Engagement
            </Link>

            <Link to="/features/outreach">
              Automated Outreach
            </Link>
          </div>


          {/* =================================================
              SOLUTIONS
          ================================================= */}

          <div className="footer-column">
            <h4>Solutions</h4>

            <Link to="/solutions/lead-data">
              Find Better Opportunities
            </Link>

            <Link to="/solutions/ai-qualification">
              Work Smarter With AI
            </Link>

            <Link to="/solutions/automation">
              Accelerate Growth
            </Link>

            <Link to="/solutions/collaboration">
              Scale Your Sales Process
            </Link>

            <Link to="/solutions/segmentation">
              Smart Segmentation
            </Link>

            <Link to="/solutions/conversion-insights">
              Conversion Insights
            </Link>
          </div>


          {/* =================================================
              HOW IT WORKS
          ================================================= */}

          <div className="footer-column">
            <h4>How It Works</h4>

            <Link to="/how-it-works/capture">
              Capture
            </Link>

            <Link to="/how-it-works/qualification">
              Qualify
            </Link>

            <Link to="/how-it-works/outreach">
              Engage
            </Link>

            <Link to="/how-it-works/conversion">
              Convert
            </Link>

            <Link to="/how-it-works/intelligence">
              Lead Intelligence
            </Link>

            <Link to="/how-it-works/pipeline">
              Pipeline Visibility
            </Link>
          </div>


          {/* =================================================
              INDUSTRIES
          ================================================= */}

          <div className="footer-column">
            <h4>Industries</h4>

            <Link to="/industries/real-estate">
              Real Estate
            </Link>

            <Link to="/industries/education">
              Education
            </Link>

            <Link to="/industries/real-estate">
              Property Leads
            </Link>

            <Link to="/industries/education">
              Student Enquiries
            </Link>
          </div>


          {/* =================================================
              INTEGRATIONS
          ================================================= */}

          <div className="footer-column">
            <h4>Integrations</h4>

            <Link to="/integrations/crm">
              CRM Integrations
            </Link>

            <Link to="/integrations/marketing">
              Marketing Platforms
            </Link>

            <Link to="/integrations/communication">
              Communication Tools
            </Link>

            <Link to="/integrations/data-sync">
              Data Synchronization
            </Link>

            <Link to="/integrations/workflows">
              Workflow Automation
            </Link>

            <Link to="/integrations/flexible">
              Flexible Integrations
            </Link>
          </div>


          {/* =================================================
              COMPANY / SUPPORT
          ================================================= */}

          <div className="footer-column">
            <h4>Company</h4>

            <Link to="/pricing">
              Pricing
            </Link>

            <Link to="/blogs">
              Blogs
            </Link>

            <Link to="/all-blogs">
              All Blogs
            </Link>

            <Link to="/get-started">
              Contact Us
            </Link>

            <Link to="/get-started">
              Book a Demo
            </Link>

            <Link to="/get-started">
              Get Started
            </Link>
          </div>

        </div>


        {/* =================================================
            FOOTER BOTTOM
        ================================================= */}

        <div className="footer-bottom">

          <p>
            © {new Date().getFullYear()} GradLead AI.
            All rights reserved.
          </p>

          <div className="footer-legal">

            <Link to="/privacy">
              Privacy Policy
            </Link>

            <Link to="/terms">
              Terms of Use
            </Link>

            <Link to="/cookies">
              Cookie Policy
            </Link>

          </div>

        </div>

      </div>
    </footer>
  );
}