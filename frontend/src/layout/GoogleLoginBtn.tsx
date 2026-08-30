"use client";

import { SignIn } from "@clerk/nextjs";

const GoogleLoginButton = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-container-low px-6">
      <div className="w-full max-w-md rounded-3xl bg-surface-container-lowest p-8 shadow-lg">
        <div className="mb-8 text-center">
          <p className="text-xs font-label uppercase tracking-widest text-secondary-foreground">
            Corner Store
          </p>
          <h2 className="mt-2 text-3xl font-heading font-extrabold tracking-tighter text-foreground">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-secondary-foreground">
            Sign in with your Google account to continue.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          {/* Stay on /login after sign-in — the login page's own effect
              redirects to /dashboard or / once the profile role is known. */}
          <SignIn
            fallbackRedirectUrl="/login"
            signUpFallbackRedirectUrl="/login"
          />
        </div>
      </div>
    </div>
  );
};

export default GoogleLoginButton;
