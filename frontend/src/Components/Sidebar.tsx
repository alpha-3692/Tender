import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  BriefcaseBusiness,
  FolderOpen,
  Building2,
  CalendarDays,
  Sparkles,
  Settings,
  HelpCircle,
  ChevronLeft,
  ShieldCheck,
  LogOut,
  UserRound,
} from "lucide-react";
import "./Sidebar.css";

const mainLinks = [
  { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
  { label: "Tender Explorer", path: "/tenders", icon: Search },
  { label: "My Bids", path: "/bids", icon: BriefcaseBusiness },
  { label: "Document Vault", path: "/documents", icon: FolderOpen },
  { label: "Company Profile", path: "/company", icon: Building2 },
  { label: "Deadline Calendar", path: "/calendar", icon: CalendarDays },
];

type UserProfile = {
  id: number;
  full_name: string;
  email: string;
  company_name: string;
  is_active: boolean;
};

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  /*
   * Read the saved login information if your login page stores it.
   * Adjust the storage key to match your existing authentication code.
   */
  const [user] = useState<UserProfile | null>(() => {
    try {
      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        return null;
      }

      return JSON.parse(savedUser) as UserProfile;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/login", { replace: true });
};

  const displayName = user?.full_name || "My Workspace";

  const initials = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "TM";

  return (
    <aside className="sidebar">
      <NavLink to="/" className="sidebar-brand">
        <span className="sidebar-logo">T</span>
        <span>
          Tender<span className="sidebar-brand-green">Mitra</span>
        </span>
        <ChevronLeft className="sidebar-collapse" size={17} />
      </NavLink>

      <div className="workspace-label">WORKSPACE</div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {mainLinks.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/dashboard"}
            className={({ isActive }) =>
              `sidebar-link${isActive ? " active" : ""}`
            }
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-divider" />

      <div className="workspace-label">INTELLIGENCE</div>

      <NavLink
        to="/assistant"
        className={({ isActive }) =>
          `sidebar-link${isActive ? " active" : ""}`
        }
      >
        <Sparkles size={18} strokeWidth={1.8} />
        <span>AI Tender Assistant</span>
        <span className="ai-tag">AI</span>
      </NavLink>

      <div className="sidebar-bottom">
        <div className="security-note">
          <ShieldCheck size={19} />
          <div>
            <strong>Your data, protected</strong>
            <span>Secure business workspace</span>
          </div>
        </div>

        <NavLink
          to="/help"
          className={({ isActive }) =>
            `sidebar-link${isActive ? " active" : ""}`
          }
        >
          <HelpCircle size={18} />
          <span>Help &amp; Support</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `sidebar-link${isActive ? " active" : ""}`
          }
        >
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>

        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>

          <div className="user-details">
            <strong>{displayName}</strong>
            <span>
              {user?.company_name || user?.email || "signed in"}
            </span>
          </div>

          <button
            type="button"
            className="user-menu"
            aria-label="Account menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            ···
          </button>

          {menuOpen && (
            <div className="sidebar-account-menu">
              {user && (
                <div className="account-menu-profile">
                  <UserRound size={16} />
                  <span>{user.email}</span>
                </div>
              )}

              <button
                type="button"
                className="account-menu-logout"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
