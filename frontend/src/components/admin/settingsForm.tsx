"use client";

import { useEffect } from "react";
import { useForm, Controller, Control, FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

import { useSettings } from "@/contexts/SettingsContext";
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
  minOrderAmount: settings?.minOrderAmount ?? 0,
  freeDeliveryThreshold: settings?.freeDeliveryThreshold ?? 0,
  deliveryRadiusKm: settings?.deliveryRadiusKm ?? 20,
  deliveryTimeWindow: settings?.deliveryTimeWindow ?? "",
  taxRate: settings?.taxRate ?? 16,
  mpesaEnabled: settings?.mpesaEnabled ?? true,
  codEnabled: settings?.codEnabled ?? true,
  allowRegistration: settings?.allowRegistration ?? true,
  hideOutOfStock: settings?.hideOutOfStock ?? false,
  storeOpen: settings?.storeOpen ?? true,
  storeTagline: settings?.storeTagline ?? "",
  announcementBanner: settings?.announcementBanner ?? "",
  supportEmail: settings?.supportEmail ?? "",
  supportPhone: settings?.supportPhone ?? "",
});

interface SwitchFieldProps {
  name: FieldPath<SettingsFormValues>;
  label: string;
  description?: string;
  control: Control<SettingsFormValues>;
}

const SwitchField = ({ name, label, description, control }: SwitchFieldProps) => (
  <Controller
    control={control}
    name={name}
    render={({ field }) => (
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-1 pr-4">
          <h4 className="font-medium">{label}</h4>

          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />
      </div>
    )}
  />
);

const SettingsForm = () => {
  const { settings, applySettings } = useSettings();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: buildFormValues(settings),
  });

  useEffect(() => {
    reset(buildFormValues(settings));
  }, [settings, reset]);

  const onSubmit = handleSubmit(
    async (values) => {
      try {
        const updated = await apiRequest<Settings>("/api/admin/settings", {
          method: "PUT",
          json: values,
        });

        applySettings(updated);
        reset(buildFormValues(updated));
        toast.success("Settings saved.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to save settings.",
        );
      }
    },
    () => {
      toast.error("Please fix the highlighted fields before saving.");
    },
  );

  const selectClass =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

  return (
    <form onSubmit={onSubmit}>
      <SettingsSection
        title="Store"
        description="Store identity, opening state, and announcement."
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

          <FormField
            id="storeTagline"
            label="Store Tagline"
            error={errors.storeTagline?.message}
            description="Short tagline shown next to the store name."
            className="md:col-span-2"
          >
            <Input
              id="storeTagline"
              placeholder="Fresh groceries, delivered fast"
              {...register("storeTagline")}
            />
          </FormField>

          <FormField
            id="announcementBanner"
            label="Announcement Banner"
            error={errors.announcementBanner?.message}
            description="Shown at the top of the store. Leave empty to hide."
            className="md:col-span-2"
          >
            <Input
              id="announcementBanner"
              placeholder="e.g. Free delivery on orders over KES 2,000"
              {...register("announcementBanner")}
            />
          </FormField>
        </div>

        <SwitchField
          name="storeOpen"
          label="Store Open"
          description="When off, the storefront shows a closed notice and blocks checkout."
          control={control}
        />
      </SettingsSection>

      <SettingsSection
        title="Orders"
        description="Rules that apply to every customer order."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            id="minOrderAmount"
            label="Minimum Order Amount"
            error={errors.minOrderAmount?.message}
            description="Reject checkout below this subtotal. 0 disables it."
          >
            <Input
              id="minOrderAmount"
              type="number"
              step="0.01"
              {...register("minOrderAmount")}
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
              {...register("orderAutoCancelHours")}
            />
          </FormField>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Delivery"
        description="Delivery charges, radius, and time windows."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            id="deliveryFee"
            label="Delivery Fee"
            error={errors.deliveryFee?.message}
            description="Default delivery fee charged to customers."
          >
            <Input
              id="deliveryFee"
              type="number"
              step="0.01"
              {...register("deliveryFee")}
            />
          </FormField>

          <FormField
            id="freeDeliveryThreshold"
            label="Free Delivery Threshold"
            error={errors.freeDeliveryThreshold?.message}
            description="Orders at or above this subtotal get free delivery. 0 disables it."
          >
            <Input
              id="freeDeliveryThreshold"
              type="number"
              step="0.01"
              {...register("freeDeliveryThreshold")}
            />
          </FormField>

          <FormField
            id="deliveryRadiusKm"
            label="Delivery Radius (km)"
            error={errors.deliveryRadiusKm?.message}
            description="Maximum delivery distance from the store."
          >
            <Input
              id="deliveryRadiusKm"
              type="number"
              {...register("deliveryRadiusKm")}
            />
          </FormField>

          <FormField
            id="deliveryTimeWindow"
            label="Delivery Time Window"
            error={errors.deliveryTimeWindow?.message}
            description="e.g. 08:00 - 20:00. Leave empty to show no window."
          >
            <Input
              id="deliveryTimeWindow"
              placeholder="08:00 - 20:00"
              {...register("deliveryTimeWindow")}
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
              {...register("taxRate")}
            />
          </FormField>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Inventory"
        description="Low stock alerts and product visibility."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            id="lowStockThreshold"
            label="Low Stock Threshold"
            error={errors.lowStockThreshold?.message}
            description="Flag inventory items at or below this quantity."
          >
            <Input
              id="lowStockThreshold"
              type="number"
              {...register("lowStockThreshold")}
            />
          </FormField>
        </div>

        <SwitchField
          name="hideOutOfStock"
          label="Hide Out-of-Stock Products"
          description="Remove sold-out products from the storefront catalogue."
          control={control}
        />
      </SettingsSection>

      <SettingsSection
        title="Payments"
        description="Enable or disable payment methods at checkout."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <SwitchField
            name="mpesaEnabled"
            label="M-Pesa (STK Push)"
            description="Allow customers to pay via M-Pesa."
            control={control}
          />

          <SwitchField
            name="codEnabled"
            label="Cash on Delivery"
            description="Allow customers to pay in cash when the order arrives."
            control={control}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Customers"
        description="Customer-facing account options."
      >
        <SwitchField
          name="allowRegistration"
          label="Allow New Registrations"
          description="When off, new customers cannot create accounts."
          control={control}
        />
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
              className={selectClass}
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
              className={selectClass}
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
        <SwitchField
          name="notificationsEnabled"
          label="Enable Notifications"
          description="Receive notifications for new orders, payments and inventory alerts."
          control={control}
        />
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
