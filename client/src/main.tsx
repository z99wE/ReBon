if (typeof window !== "undefined" && window.trustedTypes && window.trustedTypes.createPolicy) {
  try {
    window.trustedTypes.createPolicy("default", {
      createHTML: (string) => string,
      createScript: (string) => string,
      createScriptURL: (string) => string,
    });
  } catch (e) {
    console.warn("Failed to create default Trusted Types policy:", e);
  }
}

import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";

import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient();

function injectAnalytics() {
  const { VITE_ANALYTICS_ENDPOINT, VITE_ANALYTICS_WEBSITE_ID } =
    import.meta.env as Record<string, string | undefined>;

  if (!VITE_ANALYTICS_ENDPOINT || !VITE_ANALYTICS_WEBSITE_ID) return;
  if (document.querySelector('script[data-rebon-analytics="true"]')) return;

  const script = document.createElement("script");
  script.defer = true;
  script.src = `${VITE_ANALYTICS_ENDPOINT.replace(/\/$/, "")}/umami`;
  script.dataset.websiteId = VITE_ANALYTICS_WEBSITE_ID;
  script.dataset.rebonAnalytics = "true";
  document.head.appendChild(script);
}

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

injectAnalytics();

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
