export interface JwtPayload {
  id: String;
  email: String;
  role: "admin" | "user";
}
