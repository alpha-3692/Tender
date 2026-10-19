import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileSearch,
  FileText,
  Plus,
  ShieldAlert,
  Sparkles,
  Upload,
} from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import { getTenders, type Tender } from "../services/tenderApi";
import "./Dashboard.css";

const activities = [
  {
    icon: FileSearch,
    title: "Tender analysis completed",
    detail: "Demo activity — not yet connected",
    time: "Sample",
    color: "activity-green",
  },
  {
    icon: ShieldAlert,
    title: "Documents need attention",
    detail: "Document tracking is not connected yet",
    time: "Sample",
    color: "activity-amber",
  },
  {
    icon: Upload,
    title: "Tender added to workspace",
    detail: "Activity history is not connected yet",
    time: "Sample",
    color: "activity-blue",
  },
];

export default function Dashboard() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    async function loadTenders() {
      if (!token) {
        setTenders([]);
        setLoading(false);
        setError("");
        return;
      }

      setLoading(true);

      try {
        const data = await getTenders(token);
        setTenders(data);
        setError("");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load tenders."
        );
      } finally {
        setLoading(false);
      }
    }

    loadTenders();
  }, [token]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingTenders = tenders.filter((tender) => {
    const deadline = new Date(`${tender.deadline}T00:00:00`);
    const daysLeft =
      (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

    return daysLeft >= 0 && daysLeft <= 7;
  });

  const activeCount = tenders.filter(
    (tender) =>
      tender.status === "open" || tender.status === "under_review"
  ).length;

  const qualifiedCount = tenders.filter(
    (tender) => tender.status === "qualified"
  ).length;

  const attentionCount = tenders.filter(
    (tender) =>
      tender.status === "under_review" ||
      tender.status === "not_qualified"
  ).length;

  const formatDeadline = (date: string) =>
    new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatValue = (value: number | null) =>
    value === null
      ? "Not specified"
      : new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(value);

  const getStatusClass = (status: Tender["status"]) => {
    switch (status) {
      case "qualified":
        return "eligible";
      case "under_review":
        return "review";
      case "not_qualified":
        return "missing";
      default:
        return "review";
    }
  };

  const getStatusLabel = (status: Tender["status"]) => {
    switch (status) {
      case "open":
        return "Open";
      case "under_review":
        return "Under review";
      case "qualified":
        return "Qualified";
      case "not_qualified":
        return "Not qualified";
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="breadcrumb">
            Workspace <span>/</span> <strong>Overview</strong>
          </div>

          <div className="header-actions">
            <span className="demo-badge">WORKSPACE</span>
            <button
              className="notification-button"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={18} />
              <span />
            </button>
            <div className="header-avatar">MB</div>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="welcome-section">
            <div>
              <span className="welcome-eyebrow">
                <Sparkles size={14} /> YOUR TENDER COMMAND CENTER
              </span>
              <h1>Good morning, welcome back.</h1>
              <p>
                Here's what's happening with your tender pipeline today.
              </p>
            </div>

            <div className="welcome-actions">
              <Link className="outline-action" to="/tenders">
                <FileSearch size={16} /> Explore tenders
              </Link>
              <Link className="solid-action" to="/tenders">
                <Plus size={17} /> Analyze a tender
              </Link>
            </div>
          </section>

          <section className="dashboard-stats-grid">
            <article className="overview-stat">
              <div className="overview-stat-top">
                <span>Active tenders</span>
                <span className="stat-icon stat-icon-green">
                  <FileText size={18} />
                </span>
              </div>
              <strong>{loading ? "—" : activeCount}</strong>
              <div className="stat-foot">
                <ArrowUpRight size={14} />
                <span>Open or under review</span>
              </div>
            </article>

            <article className="overview-stat">
              <div className="overview-stat-top">
                <span>Eligible to bid</span>
                <span className="stat-icon stat-icon-blue">
                  <CheckCircle2 size={18} />
                </span>
              </div>
              <strong>{loading ? "—" : qualifiedCount}</strong>
              <div className="stat-foot">
                <ArrowUpRight size={14} />
                <span>Marked qualified</span>
              </div>
            </article>

            <article className="overview-stat">
              <div className="overview-stat-top">
                <span>Need attention</span>
                <span className="stat-icon stat-icon-amber">
                  <ShieldAlert size={18} />
                </span>
              </div>
              <strong>{loading ? "—" : attentionCount}</strong>
              <div className="stat-foot stat-foot-amber">
                <Clock3 size={14} />
                <span>Review or disqualification status</span>
              </div>
            </article>

            <article className="overview-stat">
              <div className="overview-stat-top">
                <span>Upcoming deadlines</span>
                <span className="stat-icon stat-icon-purple">
                  <CalendarClock size={18} />
                </span>
              </div>
              <strong>{loading ? "—" : upcomingTenders.length}</strong>
              <div className="stat-foot">
                <ArrowDownRight size={14} />
                <span>Within the next 7 days</span>
              </div>
            </article>
          </section>

          <section className="dashboard-grid">
            <article className="panel tender-panel">
              <div className="panel-heading">
                <div>
                  <h2>Recent tenders</h2>
                  <p>Your latest saved tender records</p>
                </div>
                <Link className="text-link" to="/tenders">
                  View all <ArrowRight size={14} />
                </Link>
              </div>

              <div className="table-scroll">
                <table className="tender-table">
                  <thead>
                    <tr>
                      <th>TENDER</th>
                      <th>VALUE</th>
                      <th>DEADLINE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4}>Loading tenders...</td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={4}>{error}</td>
                      </tr>
                    ) : tenders.length === 0 ? (
                      <tr>
                        <td colSpan={4}>
                          No tenders found. Add your first tender through the
                          Tenders page.
                        </td>
                      </tr>
                    ) : (
                      [...tenders]
                        .sort((a, b) => b.id - a.id)
                        .slice(0, 5)
                        .map((tender) => (
                          <tr key={tender.id}>
                            <td>
                              <div className="tender-name">{tender.title}</div>
                              <div className="tender-reference">
                                {tender.tender_reference}
                              </div>
                              <div className="tender-department">
                                {tender.organization}
                              </div>
                            </td>

                            <td className="tender-value">
                              {formatValue(tender.estimated_value)}
                            </td>

                            <td className="tender-deadline">
                              {formatDeadline(tender.deadline)}
                            </td>

                            <td>
                              <span
                                className={`tender-status ${getStatusClass(tender.status)}`}
                              >
                                {getStatusLabel(tender.status)}
                              </span>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>

              {error ? (
                <div className="demo-disclaimer">
                  <ShieldAlert size={14} />
                  Check that the backend is running on port 8001.
                </div>
              ) : (
                <div className="demo-disclaimer">
                  <CheckCircle2 size={14} />
                  Tender records are loaded from your backend database.
                </div>
              )}
            </article>

            <article className="panel deadline-panel">
              <div className="panel-heading">
                <div>
                  <h2>Coming up</h2>
                  <p>Deadlines from your saved tenders</p>
                </div>
                <CalendarClock size={19} color="#087f5b" />
              </div>

              {loading ? (
                <p>Loading deadlines...</p>
              ) : error ? (
                <p>Deadlines are unavailable because tenders could not load.</p>
              ) : upcomingTenders.length === 0 ? (
                <p>No tender deadlines in the next 7 days.</p>
              ) : (
                [...upcomingTenders]
                  .sort(
                    (a, b) =>
                      new Date(a.deadline).getTime() -
                      new Date(b.deadline).getTime()
                  )
                  .slice(0, 3)
                  .map((tender) => (
                    <div className="deadline-item" key={tender.id}>
                      <div className="deadline-date">
                        <span>
                          {new Date(
                            `${tender.deadline}T00:00:00`
                          )
                            .toLocaleDateString("en-IN", {
                              month: "short",
                            })
                            .toUpperCase()}
                        </span>
                        <strong>
                          {new Date(
                            `${tender.deadline}T00:00:00`
                          ).getDate()}
                        </strong>
                      </div>

                      <div className="deadline-info">
                        <strong>{tender.title}</strong>
                        <span>{formatDeadline(tender.deadline)}</span>
                      </div>

                      <span className="deadline-dot" />
                    </div>
                  ))
              )}

              <Link className="deadline-footer" to="/calendar">
                Open deadline calendar <ArrowRight size={14} />
              </Link>
            </article>
          </section>

          <section className="dashboard-grid bottom-grid">
            <article className="panel activity-panel">
              <div className="panel-heading">
                <div>
                  <h2>Recent activity</h2>
                  <p>Activity history integration is coming next</p>
                </div>
              </div>

              <div className="activity-list">
                {activities.map((activity) => {
                  const Icon = activity.icon;

                  return (
                    <div className="activity-item" key={activity.title}>
                      <div className={`activity-icon ${activity.color}`}>
                        <Icon size={17} />
                      </div>
                      <div className="activity-info">
                        <strong>{activity.title}</strong>
                        <span>{activity.detail}</span>
                      </div>
                      <time>{activity.time}</time>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="assistant-card">
              <div className="assistant-symbol">
                <Sparkles size={23} />
              </div>
              <span className="assistant-label">YOUR AI ASSISTANT</span>
              <h2>Make sense of every tender.</h2>
              <p>
                Get help understanding eligibility conditions, required
                documents, and tender clauses.
              </p>
              <Link to="/assistant" className="assistant-link">
                Explore the assistant <ArrowRight size={15} />
              </Link>
              <div className="assistant-decoration">✳</div>
            </article>
          </section>

          <footer className="dashboard-footer">
            <span>© 2026 TenderMitra</span>
            <span>Better-informed bidding starts here.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}