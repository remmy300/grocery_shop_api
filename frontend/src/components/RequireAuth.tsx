import { type ReactNode, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { apiRequest, clearStoredSession, hasStoredAccessToken } from "@/lib/api";

type RequireAuthProps = {
  children?: ReactNode;
};

const RequireAuth = ({ children }: RequireAuthProps) => {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;

    const validateSession = async () => {
      if (!hasStoredAccessToken()) {
        if (active) {
          setAuthorized(false);
          setChecking(false);
        }
        return;
      }

      try {
        await apiRequest("/api/auth/me");
        if (active) {
          setAuthorized(true);
        }
      } catch {
        clearStoredSession();
        if (active) {
          setAuthorized(false);
        }
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    };

    validateSession();

    return () => {
      active = false;
    };
  }, [location.pathname]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-4 text-secondary-foreground">Checking sign-in...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children ?? <Outlet />;
};

export default RequireAuth;
