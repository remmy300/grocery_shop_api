import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";

type SettingsResponse = {
  workspaceName: string;
  defaultCurrency: string;
  notificationsEnabled: boolean;
  updatedAt: string;
};

const SettingsPage = () => {
  const [data, setData] = useState<SettingsResponse | null>(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadSettings = async () => {
      try {
        setLoading(true);
        const response = await apiRequest<SettingsResponse>("/api/admin/settings");
        if (!active) return;
        setData(response);
        setWorkspaceName(response.workspaceName);
        setDefaultCurrency(response.defaultCurrency);
        setNotificationsEnabled(response.notificationsEnabled);
        setError(null);
      } catch (requestError) {
        if (!active) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to load settings",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      active = false;
    };
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await apiRequest<SettingsResponse>("/api/admin/settings", {
        method: "PUT",
        json: {
          workspaceName,
          defaultCurrency,
          notificationsEnabled,
        },
      });
      setData(response);
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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-4 text-secondary-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-label uppercase tracking-widest text-secondary-foreground">
            Settings
          </p>
          <h1 className="text-4xl font-heading font-extrabold tracking-tighter text-foreground">
            Account & system preferences
          </h1>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card shadow-sm">
          <CardContent className="p-8">
            <p className="text-sm font-medium text-foreground">
              Workspace settings
            </p>
            <p className="mt-2 text-muted-foreground">
              Manage notifications, team access, and operating preferences.
            </p>
            <div className="mt-6 space-y-4">
              <Input
                className="bg-card border-none focus:ring-1 focus:ring-primary/20"
                value={workspaceName}
                onChange={(event) => setWorkspaceName(event.target.value)}
                placeholder="Workspace name"
              />
              <Input
                className="bg-card border-none focus:ring-1 focus:ring-primary/20"
                value={defaultCurrency}
                onChange={(event) => setDefaultCurrency(event.target.value)}
                placeholder="Default currency"
              />
              <label className="flex items-center gap-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(event) => setNotificationsEnabled(event.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                Enable admin notifications
              </label>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary text-primary-foreground px-5 py-3 rounded-full"
              >
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm">
          <CardContent className="p-8">
            <p className="text-sm font-medium text-foreground">Current state</p>
            <p className="mt-2 text-muted-foreground">
              Last updated{" "}
              {data ? new Date(data.updatedAt).toLocaleString() : "recently"}.
            </p>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-surface-container-low px-4 py-3">
                <span className="text-secondary-foreground">Workspace</span>
                <span className="font-semibold text-foreground">
                  {data?.workspaceName}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-surface-container-low px-4 py-3">
                <span className="text-secondary-foreground">Currency</span>
                <span className="font-semibold text-foreground">
                  {data?.defaultCurrency}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-surface-container-low px-4 py-3">
                <span className="text-secondary-foreground">Notifications</span>
                <span className="font-semibold text-foreground">
                  {data?.notificationsEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
