
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";
import { useEffect, type ReactNode } from "react";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Tenders from "./pages/Tenders";
import Documents from "./pages/Documents";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import { AuthProvider, useAuth } from "./context/AuthContext";

function ComingSoon({ title }: { title: string }) {
  return (
    <div style={{ padding: "50px", fontFamily: "sans-serif" }}>
      <h1>{title}</h1>
      <p>This section will be implemented in the next development milestones.</p>
      <Link to="/dashboard">← Back to dashboard</Link>
    </div>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p style={{ padding: 32 }}>Checking your session...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      <Route
        path="/signup"
        element={user ? <Navigate to="/dashboard" replace /> : <Signup />}
      />

      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />

      <Route
        path="/tenders"
        element={
          <RequireAuth>
            <Tenders />
          </RequireAuth>
        }
      />

      <Route
        path="/documents"
        element={
          <RequireAuth>
            <Documents />
          </RequireAuth>
        }
      />

      <Route path="/bids" element={<RequireAuth><ComingSoon title="My Bids" /></RequireAuth>} />
      <Route path="/company" element={<RequireAuth><ComingSoon title="Company Profile" /></RequireAuth>} />
      <Route path="/calendar" element={<RequireAuth><ComingSoon title="Deadline Calendar" /></RequireAuth>} />
      <Route path="/assistant" element={<RequireAuth><ComingSoon title="AI Tender Assistant" /></RequireAuth>} />
      <Route path="/help" element={<RequireAuth><ComingSoon title="Help & Support" /></RequireAuth>} />
      <Route path="/settings" element={<RequireAuth><ComingSoon title="Settings" /></RequireAuth>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
