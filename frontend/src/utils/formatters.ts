export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);

export const toNumber = (value: number | string | null | undefined) => {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

export const formatDate = (
  value: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  },
) => {
  if (!value) {
    return "Unknown";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", options).format(date);
};

export const formatRelativeTime = (value: string | Date | null | undefined) => {
  if (!value) {
    return "Unknown";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  const diffInSeconds = Math.round((Date.now() - date.getTime()) / 1000);
  const absoluteDiff = Math.abs(diffInSeconds);

  if (absoluteDiff < 60) {
    return "Just now";
  }

  if (absoluteDiff < 3600) {
    return `${Math.round(absoluteDiff / 60)} minutes ago`;
  }

  if (absoluteDiff < 86400) {
    return `${Math.round(absoluteDiff / 3600)} hours ago`;
  }

  if (absoluteDiff < 604800) {
    return `${Math.round(absoluteDiff / 86400)} days ago`;
  }

  return formatDate(date);
};

export const displayNameFromEmail = (email: string) => {
  const localPart = email.split("@")[0] || email;

  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export const initialsFrom = (value: string) => {
  const words = value
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const initials =
    words
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join("") || value.slice(0, 2);

  return initials.toUpperCase();
};

export const slugify = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, ".");
