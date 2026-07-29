import SettingsForm from "@/components/admin/settingsForm";
import SettingsHeader from "@/components/admin/settingsHeader";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <SettingsHeader
        title="Settings"
        description="Manage your store configuration and preferences."
      />

      <SettingsForm />
    </div>
  );
}
