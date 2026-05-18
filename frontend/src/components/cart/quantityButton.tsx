import React from "react";

type Props = {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

const QuantityButton = ({ children, onClick, disabled = false }: Props) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
};

export default QuantityButton;
