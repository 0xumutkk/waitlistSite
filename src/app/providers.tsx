"use client";

import { createContext, useContext } from "react";
import { PrivyProvider, usePrivy } from "@privy-io/react-auth";

type AuthContextValue = {
  ready: boolean;
  authenticated: boolean;
  getAccessToken: () => Promise<string | null>;
  login: () => void;
  logout: () => Promise<void>;
};

const defaultAuthContextValue: AuthContextValue = {
  ready: true,
  authenticated: false,
  getAccessToken: async () => null,
  login: () => {
    console.warn("NEXT_PUBLIC_PRIVY_APP_ID is not configured.");
  },
  logout: async () => {},
};

const AuthContext = createContext<AuthContextValue>(defaultAuthContextValue);

export function usePerminalAuth() {
  return useContext(AuthContext);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    return <AuthContext.Provider value={defaultAuthContextValue}>{children}</AuthContext.Provider>;
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["email", "twitter"],
        appearance: {
          accentColor: "#36bf5a",
          landingHeader: "Join Perminal",
          loginMessage: "Sign in with email or X to claim your invite link.",
          theme: "light",
        },
      }}
    >
      <PrivyAuthBridge>{children}</PrivyAuthBridge>
    </PrivyProvider>
  );
}

function PrivyAuthBridge({ children }: { children: React.ReactNode }) {
  const { authenticated, getAccessToken, login, logout, ready } = usePrivy();

  return (
    <AuthContext.Provider value={{ authenticated, getAccessToken, login, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}
