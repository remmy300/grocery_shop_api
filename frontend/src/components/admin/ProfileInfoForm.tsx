"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";
import { apiRequest } from "@/lib/api";
import { ApiError, type ProfileResponse } from "@/types";

import {
  profileInfoSchema,
  type ProfileInfoFormValues,
} from "@/app/(admin)/dashboard/profile/profile.schema";

import SettingsSection from "./SettingsSection";
import SaveActions from "./saveAction";
import FormField from "./formsField";

interface ProfileInfoFormProps {
  profile: ProfileResponse;
}

const ProfileInfoForm = ({ profile }: ProfileInfoFormProps) => {
  const { updateProfile } = useApp();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileInfoFormValues>({
    resolver: zodResolver(profileInfoSchema),
    defaultValues: { email: profile.email },
  });

  useEffect(() => {
    reset({ email: profile.email });
  }, [profile.email, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const updated = await apiRequest<ProfileResponse>("/api/admin/profile", {
        method: "PATCH",
        json: values,
      });

      updateProfile(updated);
      reset({ email: updated.email });
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Failed to update profile.",
      );
    }
  });

  return (
    <form onSubmit={onSubmit}>
      <SettingsSection
        title="Account Information"
        description="Update the email address associated with your admin account."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            id="email"
            label="Email Address"
            required
            error={errors.email?.message}
          >
            <Input id="email" type="email" {...register("email")} />
          </FormField>
        </div>

        <SaveActions
          isDirty={isDirty}
          isSubmitting={isSubmitting}
          onReset={() => {
            reset({ email: profile.email });
            toast.info("Changes discarded.");
          }}
        />
      </SettingsSection>
    </form>
  );
};

export default ProfileInfoForm;
