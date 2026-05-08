"use client";

import { Search, X } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
};

export function SearchInput({ value, onChange, onClear }: Props) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search products..."
        className="
          h-12
          w-full
          rounded-2xl
          border
          border-zinc-200
          bg-white
          pl-11
          pr-11
          text-sm
          outline-none
          transition
          focus:border-green-700
          focus:ring-4
          focus:ring-green-100
        "
      />

      {value && (
        <button
          onClick={onClear}
          className="
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            rounded-full
            p-1
            text-zinc-400
            transition
            hover:bg-zinc-100
            hover:text-zinc-700
          "
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
