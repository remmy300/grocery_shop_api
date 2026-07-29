"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";

import SettingsHeader from "@/components/admin/settingsHeader";
import ProfileInfoForm from "@/components/admin/ProfileInfoForm";
import PasswordForm from "@/components/admin/PasswordForm";

const ProfilePage = () => {
  const { state } = useApp();
  const profile = state.profile;

  if (state.loading && !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        Unable to load your profile. Please refresh the page or sign in again.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SettingsHeader
        title="Profile"
        description="Manage your profile and account security."
      />

      <Card className="shadow-sm">
        <CardContent className="flex items-center gap-6 p-8">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-2xl">
              {profile.initials}
            </AvatarFallback>
          </Avatar>

          <div>
            <h3 className="text-lg font-bold text-foreground">
              {profile.displayName}
            </h3>
            <p className="text-sm text-muted-foreground">{profile.role}</p>
            <p className="text-sm text-muted-foreground">
              Joined {profile.joinedOn}
            </p>
          </div>
        </CardContent>
      </Card>

      <ProfileInfoForm profile={profile} />

      <PasswordForm />
    </div>
  );
};

export default ProfilePage;
