const QuantityButton = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition hover:bg-background active:scale-95"
    >
      {children}
    </button>
  );
};

export default QuantityButton;
