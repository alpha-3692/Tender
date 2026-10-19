
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

const API_URL = "http://127.0.0.1:8001";

export interface User {
  id: number;
  full_name: string;
  email: string;
  company_name: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signup: (
    fullName: string,
    email: string,
    companyName: string,
    password: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signup(
    fullName: string,
    email: string,
    companyName: string,
    password: string
  ) {
    const response = await fetch(`${API_URL}/api/v1/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        company_name: companyName.trim(),
        password,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.detail || "Unable to create your account.");
    }
  }

  async function login(email: string, password: string) {
    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.detail || "Invalid email or password.");
    }

    setToken(data.access_token);
    setUser(data.user);
  }

  function logout() {
    setUser(null);
    setToken(null);
  }

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    let cancelled = false;

    async function verifySession() {
      setLoading(true);

      try {
        const response = await fetch(`${API_URL}/api/v1/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (!cancelled) {
            setUser(null);
            setToken(null);
          }
          return;
        }

        const profile: User = await response.json();

        if (!cancelled) {
          setUser(profile);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void verifySession();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, signup, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
