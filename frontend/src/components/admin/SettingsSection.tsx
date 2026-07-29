import { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

const SettingsSection = ({
  title,
  description,
  children,
}: SettingsSectionProps) => {
  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-6 p-8">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>

          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {children}
      </CardContent>
    </Card>
  );
};

export default SettingsSection;
