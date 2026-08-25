"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import { apiRequest } from "@/lib/api";
import { ProfileResponse } from "@/types";
import {
  hasStoredAccessToken,
  saveSessionTokens,
} from "@/services/auth.services";
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
  applySessionTokens: (tokens: {
    accessToken: string;
    refreshToken?: string;
  }) => Promise<ProfileResponse | null>;
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

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const hydrateSession =
    useCallback(async (): Promise<ProfileResponse | null> => {
      if (!hasStoredAccessToken()) {
        dispatch({ type: "RESET" });
        return null;
      }

      dispatch({ type: "SET_LOADING", payload: true });

      try {
        const profileResult = await apiRequest<ProfileResponse>(
          "/api/auth/me",
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
    }, []);

  const applySessionTokens = useCallback(
    async (tokens: {
      accessToken: string;
      refreshToken?: string;
    }): Promise<ProfileResponse | null> => {
      saveSessionTokens(tokens);
      return await hydrateSession();
    },
    [hydrateSession],
  );

  const updateProfile = useCallback((profile: ProfileResponse) => {
    dispatch({ type: "SET_PROFILE", payload: profile });
    dispatch({ type: "SET_AUTHENTICATED", payload: true });
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();
    dispatch({ type: "RESET" });
  }, []);

  useEffect(() => {
    void hydrateSession();
  }, [hydrateSession]);

  return (
      <AppContext.Provider
        value={{
          state,
          hydrateSession,
          applySessionTokens,
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
