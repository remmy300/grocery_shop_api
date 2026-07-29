import { ReactNode } from "react";

import { Label } from "@/components/ui/label";

interface FormFieldProps {
  id: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

const FormField = ({
  id,
  label,
  description,
  error,
  required = false,
  children,
}: FormFieldProps) => {
  return (
    <div className="space-y-2">
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
