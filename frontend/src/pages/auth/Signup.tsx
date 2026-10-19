import "./Auth.css";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Signup() {
  const { signup, login } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await signup(fullName, email, companyName, password);
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your account. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-brand">
          TenderMitra
        </Link>

        <p className="auth-eyebrow">GET STARTED</p>
        <h1>Create your account</h1>
        <p className="auth-description">
          Start organizing your tenders with TenderMitra.
        </p>

        {error && <div className="auth-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            autoComplete="name"
            placeholder="Your full name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            minLength={2}
            maxLength={100}
            required
          />

          <label htmlFor="companyName">Company name</label>
          <input
            id="companyName"
            autoComplete="organization"
            placeholder="Your company"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            minLength={2}
            maxLength={200}
            required
          />

          <label htmlFor="signupEmail">Email address</label>
          <input
            id="signupEmail"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="signupPassword">Password</label>
          <div className="auth-password-field">
            <input
              id="signupPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              maxLength={128}
              required
            />
            <button
              type="button"
              className="auth-show-password"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />

          <button
            type="submit"
            className="auth-submit"
            disabled={submitting}
          >
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
