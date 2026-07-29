import { ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  id: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

const FormField = ({
  id,
  label,
  description,
  error,
  required = false,
  className,
  children,
}: FormFieldProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}

        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>

      {children}

      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
};

export default FormField;
