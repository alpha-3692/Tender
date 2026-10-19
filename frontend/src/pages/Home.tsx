import { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

function App() {
  const [email, setEmail] = useState("");

  return (
    <div className="website">
      <nav className="navbar">
        <Link className="brand" to="/">
          <span className="brand-icon">T</span>
          <span>
            Tender<span className="brand-green">Mitra</span>
          </span>
        </Link>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#benefits">Why TenderMitra</a>
        </div>

        <div className="nav-actions">
          <Link className="login-btn" to="/login">
            Log in
          </Link>

          <Link className="primary-btn nav-cta" to="/signup">
            Get started <span>↗</span>
          </Link>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="hero-content">
            <div className="announcement">
              <span className="status-dot" />
              AI-powered tender intelligence
              <span className="announcement-arrow">↗</span>
            </div>

            <h1>
              Bid smarter.
              <br />
              Win <span className="highlight">with confidence.</span>
            </h1>

            <p className="hero-description">
              Stop guessing. Start qualifying. TenderMitra helps your
              business understand tender requirements, verify eligibility,
              and stay ahead of every deadline.
            </p>

            <div className="hero-actions">
              <Link className="primary-btn large-btn" to="/signup">
                Explore TenderMitra <span>→</span>
              </Link>

              <a className="secondary-btn" href="#how-it-works">
                <span className="play-icon">▶</span>
                See how it works
              </a>
            </div>

            <div className="trust-line">
              <div className="avatar-stack">
                <span>M</span>
                <span>S</span>
                <span>R</span>
              </div>

              <p>
                Built for ambitious businesses
                <br />
                <strong>Clarity before every bid.</strong>
              </p>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-glow" />

            <div className="dashboard-card">
              <div className="dashboard-top">
                <div>
                  <span className="eyebrow">YOUR WORKSPACE</span>
                  <h3>Tender overview</h3>
                </div>

                <button className="icon-button" aria-label="More options">
                  ···
                </button>
              </div>

              <div className="dashboard-stats">
                <div className="stat-card">
                  <span>Active tenders</span>
                  <strong>12</strong>
                  <small className="green-text">↑ Your bid pipeline</small>
                </div>

                <div className="stat-card">
                  <span>Need attention</span>
                  <strong>03</strong>
                  <small className="orange-text">Review required</small>
                </div>
              </div>

              <div className="tender-heading">
                <h4>Recent analysis</h4>
                <Link to="/login">View all →</Link>
              </div>

              <div className="tender-row">
                <div className="file-icon pdf">PDF</div>

                <div className="tender-info">
                  <strong>Infrastructure Development</strong>
                  <span>Government tender · Ref. TM-2048</span>
                </div>

                <span className="match-pill">Eligible</span>
              </div>

              <div className="tender-row">
                <div className="file-icon doc">PDF</div>

                <div className="tender-info">
                  <strong>IT Equipment Procurement</strong>
                  <span>Public sector · Ref. TM-2051</span>
                </div>

                <span className="review-pill">Review</span>
              </div>

              <div className="ai-note">
                <div className="ai-spark">✳</div>

                <div>
                  <strong>Your AI tender assistant</strong>
                  <p>Understand requirements before you commit.</p>
                </div>

                <span className="note-arrow">↗</span>
              </div>
            </div>

            <div className="floating-card">
              <span className="floating-check">✓</span>

              <div>
                <strong>Requirements checked</strong>
                <span>Know what you need to qualify</span>
              </div>
            </div>
          </div>
        </section>

        <section className="proof-strip" id="benefits">
          <p>EVERY BID STARTS WITH CLARITY</p>

          <div className="proof-items">
            <span><b>✓</b> Eligibility insights</span>
            <span><b>✓</b> Document readiness</span>
            <span><b>✓</b> Deadline awareness</span>
            <span><b>✓</b> Evidence-backed answers</span>
          </div>
        </section>

        <section className="features-section" id="features">
          <div className="section-heading">
            <span className="section-label">A BETTER WAY TO BID</span>
            <h2>
              Complex tenders. <span>Simplified.</span>
            </h2>

            <p>
              Spend less time deciphering documents and more time making
              informed bidding decisions.
            </p>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <div className="feature-icon green-icon">◎</div>
              <h3>Know your eligibility</h3>

              <p>
                Compare tender conditions with your business profile,
                financials, certifications, and past experience.
              </p>

              <Link to="/signup">
                Explore eligibility <span>→</span>
              </Link>
            </article>

            <article className="feature-card">
              <div className="feature-icon blue-icon">▤</div>
              <h3>Get document-ready</h3>

              <p>
                Identify missing documents, check expiry dates, and
                understand the evidence required for each tender.
              </p>

              <Link to="/signup">
                Check compliance <span>→</span>
              </Link>
            </article>

            <article className="feature-card">
              <div className="feature-icon amber-icon">◷</div>
              <h3>Never miss a deadline</h3>

              <p>
                Organize tenders, monitor important dates, and keep
                your bidding activities on track.
              </p>

              <Link to="/signup">
                Manage deadlines <span>→</span>
              </Link>
            </article>
          </div>
        </section>

        <section className="workflow-section" id="how-it-works">
          <div className="workflow-copy">
            <span className="section-label">SIMPLE BY DESIGN</span>

            <h2>
              From tender PDF to a <span>clearer decision.</span>
            </h2>

            <p>
              Turn lengthy tender documents into a structured view of
              requirements, gaps, and next steps.
            </p>
          </div>

          <div className="workflow-steps">
            <div className="workflow-step">
              <span className="step-number">01</span>

              <div>
                <h3>Upload a tender</h3>
                <p>Start with a tender PDF and its available amendments.</p>
              </div>
            </div>

            <div className="workflow-step">
              <span className="step-number">02</span>

              <div>
                <h3>Review AI findings</h3>
                <p>
                  Inspect eligibility criteria, documents, and cited evidence.
                </p>
              </div>
            </div>

            <div className="workflow-step">
              <span className="step-number">03</span>

              <div>
                <h3>Make an informed decision</h3>
                <p>
                  Review outstanding items and plan your next steps.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section" id="get-started">
          <div>
            <span className="cta-kicker">YOUR NEXT BID STARTS HERE</span>
            <h2>Make every tender count.</h2>

            <p>
              Bring more clarity to your bidding process with TenderMitra.
            </p>
          </div>

          <form
            className="cta-form"
            onSubmit={(event) => {
              event.preventDefault();

              const signupUrl = `/signup?email=${encodeURIComponent(email)}`;
              window.location.href = signupUrl;
            }}
          >
            <input
              type="email"
              placeholder="Enter your work email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              aria-label="Work email"
            />

            <button type="submit">Get started →</button>

            <small>Create your TenderMitra account to get started.</small>
          </form>
        </section>
      </main>

      <footer className="footer">
        <Link className="brand" to="/">
          <span className="brand-icon">T</span>
          <span>
            Tender<span className="brand-green">Mitra</span>
          </span>
        </Link>

        <p>More clarity. Better-informed bids.</p>

        <span className="copyright">© 2026 TenderMitra</span>
      </footer>
    </div>
  );
}

export default App;
