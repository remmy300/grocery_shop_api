export const getAuthToken = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    localStorage.getItem("accessToken") || localStorage.getItem("token") || ""
  );
};

export const hasStoredAccessToken = () => Boolean(getAuthToken());

export const saveSessionTokens = (tokens: {
  accessToken: string;
  refreshToken?: string;
}) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem("accessToken", tokens.accessToken);
  if (tokens.refreshToken) {
    localStorage.setItem("refreshToken", tokens.refreshToken);
  }
};
