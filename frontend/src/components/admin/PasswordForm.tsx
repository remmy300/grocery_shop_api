"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { apiRequest } from "@/lib/api";
import { ApiError } from "@/types";

import {
  passwordSchema,
  type PasswordFormValues,
} from "@/app/(admin)/dashboard/profile/profile.schema";

import SettingsSection from "./SettingsSection";
import SaveActions from "./saveAction";
import FormField from "./formsField";
import PasswordInput from "./PasswordInput";

const EMPTY_PASSWORD_VALUES: PasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const PasswordForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: EMPTY_PASSWORD_VALUES,
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await apiRequest<{ message: string }>("/api/admin/profile/password", {
        method: "PATCH",
        json: {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
      });

      reset(EMPTY_PASSWORD_VALUES);
      toast.success("Password updated successfully.");
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to update password.",
      );
    }
  });

  return (
    <form onSubmit={onSubmit}>
      <SettingsSection
        title="Change Password"
        description="Choose a strong password you don't use elsewhere."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            id="currentPassword"
            label="Current Password"
            required
            error={errors.currentPassword?.message}
            className="md:col-span-2"
          >
            <PasswordInput
              id="currentPassword"
              autoComplete="current-password"
              {...register("currentPassword")}
            />
          </FormField>

          <FormField
            id="newPassword"
            label="New Password"
            required
            error={errors.newPassword?.message}
            description="At least 8 characters, with upper, lower case letters and a number."
          >
            <PasswordInput
              id="newPassword"
              autoComplete="new-password"
              {...register("newPassword")}
            />
          </FormField>

          <FormField
            id="confirmPassword"
            label="Confirm New Password"
            required
            error={errors.confirmPassword?.message}
          >
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
          </FormField>
        </div>

        <SaveActions
          isDirty={isDirty}
          isSubmitting={isSubmitting}
          saveLabel="Update Password"
          onReset={() => reset(EMPTY_PASSWORD_VALUES)}
        />
      </SettingsSection>
    </form>
  );
};

export default PasswordForm;
