import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";

type ProfileResponse = {
  id: number;
  email: string;
  role: string;
  displayName: string;
  initials: string;
  joinedOn: string;
};

const ProfilePage = () => {
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await apiRequest<ProfileResponse>("/api/admin/profile");
        if (!active) return;
        setData(response);
        setEmail(response.email);
        setError(null);
      } catch (requestError) {
        if (!active) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to load profile",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const response = await apiRequest<ProfileResponse>("/api/admin/profile", {
        method: "PATCH",
        json: { email },
      });
      setData((current) => (current ? { ...current, ...response } : response));
      setMessage("Profile saved successfully.");
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to save profile",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setSaving(true);
      await apiRequest<{ message: string }>("/api/admin/profile/password", {
        method: "PATCH",
        json: {
          currentPassword,
          newPassword,
        },
      });
      setNewPassword("");
      setCurrentPassword("");
      setMessage("Password updated successfully.");
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to update password",
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
          <p className="mt-4 text-secondary-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
        {error || "Unable to load profile"}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-label uppercase tracking-widest text-secondary-foreground">
            Profile
          </p>
          <h1 className="text-4xl font-heading font-extrabold tracking-tighter text-foreground">
            Personal information
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

      <Card className="bg-card shadow-sm">
        <CardContent className="space-y-6 p-8">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback>{data.initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-bold text-foreground">
                {data.displayName}
              </p>
              <p className="text-sm text-muted-foreground">{data.role}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              className="bg-card border-none focus:ring-1 focus:ring-primary/20"
              value={data.displayName}
              readOnly
              placeholder="Display name"
            />
            <Input
              className="bg-card border-none focus:ring-1 focus:ring-primary/20"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              type="password"
              className="bg-card border-none focus:ring-1 focus:ring-primary/20"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="Current password"
            />
            <Input
              type="password"
              className="bg-card border-none focus:ring-1 focus:ring-primary/20"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="New password"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              className="bg-primary text-primary-foreground px-5 py-3 rounded-full"
            >
              {saving ? "Saving..." : "Save profile"}
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={saving}
              variant="outline"
              className="px-5 py-3 rounded-full"
            >
              Change password
            </Button>
          </div>

          <div className="text-sm text-secondary-foreground">
            Joined on{" "}
            <span className="font-semibold text-foreground">{data.joinedOn}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
