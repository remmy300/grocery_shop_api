import { Button } from "@/components/ui/button";

interface SaveActionsProps {
  isDirty: boolean;
  isSubmitting: boolean;
  onReset: () => void;
}

const SaveActions = ({ isDirty, isSubmitting, onReset }: SaveActionsProps) => {
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
        {isSubmitting ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
};

export default SaveActions;
