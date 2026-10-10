export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { init } = await import("neatlogs");
    await init({
      apiKey: process.env.NEATLOGS_API_KEY,
      endpoint: "https://ingest.neatlogs.com",
      workflowName: "agent-configurator",
    });
  }
}
