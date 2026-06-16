export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Simple JWT auth - returns a login URL for the local auth endpoint
export const getLoginUrl = () => {
  // For simple JWT auth, we redirect to the frontend login route
  return `/login`;
};

