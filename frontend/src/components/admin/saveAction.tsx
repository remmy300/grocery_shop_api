import { Button } from "@/components/ui/button";

interface SaveActionsProps {
  isDirty: boolean;
  isSubmitting: boolean;
  onReset: () => void;
  saveLabel?: string;
  savingLabel?: string;
}

const SaveActions = ({
  isDirty,
  isSubmitting,
  onReset,
  saveLabel = "Save Changes",
  savingLabel = "Saving...",
}: SaveActionsProps) => {
  return (
    <div className="flex justify-end gap-3 border-t pt-6">
      <Button
        type="button"
        variant="outline"
        onClick={onReset}
        disabled={!isDirty || isSubmitting}
      >
        Reset
      </Button>

      <Button type="submit" disabled={!isDirty || isSubmitting}>
        {isSubmitting ? savingLabel : saveLabel}
      </Button>
    </div>
  );
};

export default SaveActions;
