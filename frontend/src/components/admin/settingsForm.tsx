"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

import { useApp } from "@/contexts/AppContext";
import { apiRequest } from "@/lib/api";

import type { Settings } from "@/types";

import {
  settingsSchema,
  type SettingsFormValues,
} from "@/app/(admin)/dashboard/settings/settings.schema";

import SettingsSection from "./SettingsSection";
import SaveActions from "./saveAction";
import FormField from "./formsField";

const buildFormValues = (settings: Settings | null): SettingsFormValues => ({
  workspaceName: settings?.workspaceName ?? "",
  defaultCurrency: settings?.defaultCurrency ?? "KES",
  notificationsEnabled: settings?.notificationsEnabled ?? true,
  timezone: settings?.timezone ?? "Africa/Nairobi",
  language: settings?.language ?? "en",
  lowStockThreshold: settings?.lowStockThreshold ?? 10,
  orderAutoCancelHours: settings?.orderAutoCancelHours ?? 24,
  deliveryFee: settings?.deliveryFee ?? 0,
  supportEmail: settings?.supportEmail ?? "",
  supportPhone: settings?.supportPhone ?? "",
  taxRate: settings?.taxRate ?? 16,
});

const SettingsForm = () => {
  const { state, updateSettings } = useApp();

  const settings = state.settings;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: buildFormValues(settings),
  });

  useEffect(() => {
    reset(buildFormValues(settings));
  }, [settings, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const updated = await apiRequest<Settings>("/api/admin/settings", {
        method: "PUT",
        json: values,
      });

      updateSettings(updated);
      reset(buildFormValues(updated));
      toast.success("Settings saved.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save settings.",
      );
    }
  });

  return (
    <form onSubmit={onSubmit}>
      <SettingsSection
        title="General"
        description="Core workspace identity and currency."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            id="workspaceName"
            label="Workspace Name"
            required
            error={errors.workspaceName?.message}
          >
            <Input id="workspaceName" {...register("workspaceName")} />
          </FormField>

          <FormField
            id="defaultCurrency"
            label="Default Currency"
            required
            error={errors.defaultCurrency?.message}
            description="3-letter currency code, e.g. KES."
          >
            <Input
              id="defaultCurrency"
              maxLength={3}
              {...register("defaultCurrency")}
            />
          </FormField>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Delivery"
        description="Configure delivery charges and order processing."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            id="deliveryFee"
            label="Delivery Fee (KES)"
            error={errors.deliveryFee?.message}
            description="Default delivery fee charged to customers."
          >
            <Input
              id="deliveryFee"
              type="number"
              step="0.01"
              {...register("deliveryFee", {
                valueAsNumber: true,
              })}
            />
          </FormField>

          <FormField
            id="orderAutoCancelHours"
            label="Auto Cancel Orders (Hours)"
            error={errors.orderAutoCancelHours?.message}
            description="Automatically cancel unpaid orders after this duration."
          >
            <Input
              id="orderAutoCancelHours"
              type="number"
              {...register("orderAutoCancelHours", {
                valueAsNumber: true,
              })}
            />
          </FormField>

          <FormField
            id="lowStockThreshold"
            label="Low Stock Threshold"
            error={errors.lowStockThreshold?.message}
            description="Flag inventory items at or below this quantity."
          >
            <Input
              id="lowStockThreshold"
              type="number"
              {...register("lowStockThreshold", {
                valueAsNumber: true,
              })}
            />
          </FormField>

          <FormField
            id="taxRate"
            label="Tax Rate (%)"
            error={errors.taxRate?.message}
            description="Default tax rate applied to orders."
          >
            <Input
              id="taxRate"
              type="number"
              step="0.01"
              {...register("taxRate", {
                valueAsNumber: true,
              })}
            />
          </FormField>
        </div>
      </SettingsSection>
      <SettingsSection
        title="Support Information"
        description="Customer support contact details."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            id="supportEmail"
            label="Support Email"
            error={errors.supportEmail?.message}
          >
            <Input
              id="supportEmail"
              type="email"
              placeholder="support@cornerstore.com"
              {...register("supportEmail")}
            />
          </FormField>

          <FormField
            id="supportPhone"
            label="Support Phone"
            error={errors.supportPhone?.message}
          >
            <Input
              id="supportPhone"
              placeholder="+254712345678"
              {...register("supportPhone")}
            />
          </FormField>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Regional Preferences"
        description="Language and timezone configuration."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            id="language"
            label="Language"
            error={errors.language?.message}
          >
            <select
              id="language"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...register("language")}
            >
              <option value="en">English</option>
              <option value="sw">Swahili</option>
            </select>
          </FormField>

          <FormField
            id="timezone"
            label="Timezone"
            error={errors.timezone?.message}
          >
            <select
              id="timezone"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...register("timezone")}
            >
              <option value="Africa/Nairobi">Africa/Nairobi</option>

              <option value="UTC">UTC</option>
            </select>
          </FormField>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Notifications"
        description="Choose which notifications administrators receive."
      >
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <h4 className="font-medium">Enable Notifications</h4>

            <p className="text-sm text-muted-foreground">
              Receive notifications for new orders, payments and inventory
              alerts.
            </p>
          </div>

          <Switch
            checked={watch("notificationsEnabled")}
            onCheckedChange={(checked) =>
              setValue("notificationsEnabled", checked, {
                shouldDirty: true,
              })
            }
          />
        </div>
      </SettingsSection>

      <SaveActions
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onReset={() => {
          reset(buildFormValues(settings));
          toast.info("Changes discarded.");
        }}
      />
    </form>
  );
};

export default SettingsForm;
