"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";
import { apiRequest } from "@/lib/api";
import { ProfileResponse } from "@/types";

const ProfilePage = () => {
  const { state, updateProfile } = useApp();
  const profile = state.profile;
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setEmail(profile.email);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const response = await apiRequest<ProfileResponse>("/api/admin/profile", {
        method: "PATCH",
        json: { email },
      });
      updateProfile(response);
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
    if (!currentPassword || !newPassword) {
      setError("Both current and new password are required.");
      return;
    }

    try {
      setSaving(true);
      setMessage(null);
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

  if (state.loading && !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-4 text-secondary-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        {error || "Unable to load profile"}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-heading font-extrabold tracking-tighter text-foreground">
          Personal Information
        </h1>
        <p className="font-medium tracking-tight text-secondary-foreground">
          Manage your profile and account security.
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
          <div className="mb-8 flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">
                {profile.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {profile.displayName}
              </h3>
              <p className="text-sm text-secondary-foreground">
                {profile.role}
              </p>
              <p className="text-sm text-secondary-foreground">
                Joined {profile.joinedOn}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              className="rounded-lg px-6 py-2.5 text-sm font-semibold"
            >
              {saving ? "Saving..." : "Update Profile"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-surface-container-lowest shadow-sm">
        <CardContent className="p-8">
          <h3 className="mb-6 text-lg font-bold text-foreground">
            Change Password
          </h3>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Current Password
              </label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                New Password
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full"
              />
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={saving}
              className="rounded-lg px-6 py-2.5 text-sm font-semibold"
            >
              {saving ? "Updating..." : "Change Password"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
