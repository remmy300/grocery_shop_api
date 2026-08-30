"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { apiRequest } from "@/lib/api";
import { ProfileResponse } from "@/types";
import { saveSessionTokens } from "@/services/auth.services";
import { clearStoredSession } from "@/services/storage.services";

interface AppState {
  profile: ProfileResponse | null;
  isAuthenticated: boolean;
  loading: boolean;
}

type AppAction =
  | { type: "SET_PROFILE"; payload: ProfileResponse | null }
  | { type: "SET_AUTHENTICATED"; payload: boolean }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "RESET" };

type AppContextValue = {
  state: AppState;
  hydrateSession: () => Promise<ProfileResponse | null>;
  updateProfile: (profile: ProfileResponse) => void;
  logout: () => void;
};

const initialState: AppState = {
  profile: null,
  isAuthenticated: false,
  loading: true,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "SET_PROFILE":
      return { ...state, profile: action.payload };
    case "SET_AUTHENTICATED":
      return { ...state, isAuthenticated: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "RESET":
      return { ...initialState, loading: false };
    default:
      return state;
  }
};

// Refresh interval for mirroring the Clerk session token into localStorage,
// which pages that read the token directly (checkout, order pages, cart)
// still rely on. Clerk's default session tokens are short-lived, so this
// keeps the mirrored copy fresh for those call sites.
const TOKEN_MIRROR_INTERVAL_MS = 30_000;

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { signOut } = useClerk();

  const hydrateSession =
    useCallback(async (): Promise<ProfileResponse | null> => {
      dispatch({ type: "SET_LOADING", payload: true });

      const token = await getToken();

      if (!token) {
        throw new Error("No Clerk session token available");
      }

      try {
        const profileResult = await apiRequest<ProfileResponse>(
          "/api/auth/sync",
          { method: "POST", authToken: "token" },
        );

        dispatch({ type: "SET_PROFILE", payload: profileResult });
        dispatch({ type: "SET_AUTHENTICATED", payload: true });

        return profileResult;
      } catch {
        clearStoredSession();
        dispatch({ type: "RESET" });
        return null;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    }, [getToken]);

  const updateProfile = useCallback((profile: ProfileResponse) => {
    dispatch({ type: "SET_PROFILE", payload: profile });
    dispatch({ type: "SET_AUTHENTICATED", payload: true });
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();
    dispatch({ type: "RESET" });
    void signOut();
  }, [signOut]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      clearStoredSession();
      dispatch({ type: "RESET" });
      return;
    }

    let cancelled = false;

    const mirrorTokenAndHydrate = async (hydrate: boolean) => {
      const token = await getToken();
      if (cancelled) return;
      if (token) {
        saveSessionTokens({ accessToken: token });
        if (hydrate) await hydrateSession();
      } else {
        clearStoredSession();
        dispatch({ type: "RESET" });
      }
    };

    void mirrorTokenAndHydrate(true);
    const interval = setInterval(
      () => void mirrorTokenAndHydrate(false),
      TOKEN_MIRROR_INTERVAL_MS,
    );

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isLoaded, isSignedIn, getToken, hydrateSession]);

  return (
    <AppContext.Provider
      value={{
        state,
        hydrateSession,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
