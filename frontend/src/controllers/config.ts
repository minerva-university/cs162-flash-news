export const DB_HOST = "http://127.0.0.1:5000/api";

export const HEADERS_WITH_JWT = (accessToken) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${accessToken}`,
});
