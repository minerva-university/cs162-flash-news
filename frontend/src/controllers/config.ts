export const DB_HOST = process.env.REACT_APP_DB_HOST;

export const HEADERS_WITH_JWT = (accessToken) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${accessToken}`,
});
