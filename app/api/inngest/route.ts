import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { ProcessScheduledAgent, ExecuteScheduledAgent } from "@/inngest/functions";

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [ProcessScheduledAgent, ExecuteScheduledAgent]
});