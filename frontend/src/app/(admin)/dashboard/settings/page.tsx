"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";
import { apiRequest } from "@/lib/api";
import { SettingsResponse } from "@/types";

const SettingsPage = () => {
  const { state, updateSettings } = useApp();
  const settings = state.settings;
  const [workspaceName, setWorkspaceName] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setWorkspaceName(settings.workspaceName);
      setDefaultCurrency(settings.defaultCurrency);
      setNotificationsEnabled(settings.notificationsEnabled);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const response = await apiRequest<SettingsResponse>(
        "/api/admin/settings",
        {
          method: "PUT",
          json: {
            workspaceName,
            defaultCurrency,
            notificationsEnabled,
          },
        },
      );
      updateSettings(response);
      setMessage("Settings saved successfully.");
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to save settings",
      );
    } finally {
      setSaving(false);
    }
  };

  if (state.loading && !settings) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-4 text-secondary-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        {error || "Unable to load settings"}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-heading font-extrabold tracking-tighter text-foreground">
          Account & System Preferences
        </h1>
        <p className="font-medium tracking-tight text-secondary-foreground">
          Manage workspace settings and admin preferences.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
          {message}
        </div>
      ) : null}

      <Card className="bg-surface-container-lowest shadow-sm">
        <CardContent className="p-8">
          <div className="mb-6">
            <h3 className="text-lg font-heading font-bold text-foreground">
              Workspace Settings
            </h3>
            <p className="text-sm text-secondary-foreground">
              Manage notifications, team access, and operating preferences.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Workspace Name
              </label>
              <Input
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Enter workspace name"
                className="w-full"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Default Currency
              </label>
              <Input
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                placeholder="KES"
                className="w-full"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="notifications"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <label
                htmlFor="notifications"
                className="cursor-pointer text-sm font-medium text-foreground"
              >
                Enable admin notifications
              </label>
            </div>

            <div className="flex gap-3 pt-6">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg px-6 py-2.5 text-sm font-semibold"
              >
                {saving ? "Saving..." : "Save Settings"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setWorkspaceName(settings.workspaceName);
                  setDefaultCurrency(settings.defaultCurrency);
                  setNotificationsEnabled(settings.notificationsEnabled);
                  setMessage(null);
                }}
                className="rounded-lg px-6 py-2.5 text-sm font-semibold"
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
