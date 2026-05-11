const SummaryRow = ({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>

      <span className={`font-bold ${valueClassName || ""}`}>{value}</span>
    </div>
  );
};

export default SummaryRow;
