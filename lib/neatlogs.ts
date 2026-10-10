import { init, wrapGoogleGenAI, trace, span, Span } from "neatlogs";

let initPromise: Promise<void> | null = null;

export function ensureNeatlogsInit(): Promise<void> {
  if (!initPromise) {
    initPromise = init({
      apiKey: process.env.NEATLOGS_API_KEY,
      endpoint: "https://ingest.neatlogs.com",
      workflowName: "agent-configurator",
    });
  }
  return initPromise;
}

export { wrapGoogleGenAI, trace, span, Span };
