import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const SettingsPage = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-label text-secondary-foreground uppercase tracking-widest">
            Settings
          </p>
          <h1 className="text-4xl font-heading font-extrabold tracking-tighter text-foreground">
            Account & system preferences
          </h1>
        </div>
      </div>

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
                placeholder="Workspace name"
              />
              <Input
                className="bg-card border-none focus:ring-1 focus:ring-primary/20"
                placeholder="Default currency"
              />
              <Button className="bg-primary text-primary-foreground px-5 py-3 rounded-full">
                Save changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
