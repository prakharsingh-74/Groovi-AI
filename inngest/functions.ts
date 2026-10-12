import type { CreatedAgentType } from "@/components/custom/agents/CreateAgent";
import { AgentConfig, AgentRun, db } from "@/db";
import { calculateNextDailyRun } from "@/lib/agent-schedule";
import { executeAgent } from "@/lib/execute-agent";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import { inngest } from "./client";

export const ProcessScheduledAgent = inngest.createFunction(
  {
    id: "process-scheduled-agent-runs",
    // Run this scheduler every 5 minutes to pick pending agent jobs
    triggers: [{ cron: "*/5 * * * *" }],
  },
  async ({ step }) => {
    const now = new Date();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);

    // Step 1: Load scheduled agent runs whose execution time is in the next hour
    const dueRuns = await step.run("load-due-agent-runs", async () => {
      return await db
        .select({
          run: AgentRun,
        })
        .from(AgentRun)
        .where(
          and(
            eq(AgentRun.status, "scheduled"),
            gte(AgentRun.scheduledFor, now),
            lte(AgentRun.scheduledFor, nextHour),
          ),
        )
        .orderBy(asc(AgentRun.scheduledFor))
        .limit(10);
    });

    const results = [];

    for (const { run } of dueRuns) {
      // Step 2: Atomically claim this scheduled run as queued.
      const queuedRun = await step.run(
        `queue-agent-run-${run.id}`,
        async () => {
          const result = await db
            .update(AgentRun)
            .set({
              status: "queued",
              queuedAt: now,
            })
            .where(
              and(
                eq(AgentRun.id, run.id),
                eq(AgentRun.status, "scheduled"),
              ),
            )
            .returning();

          return result[0] ?? null;
        },
      );

      // Step 3: If another cron already queued it, skip sending
      if (!queuedRun) {
        results.push({
          runId: run.id,
          agentId: run.agentId,
          status: "skipped",
        });
        continue;
      }

      // Step 4: Send a separate event so execution runs outside the cron
      await step.sendEvent(`send-execute-agent-event-${run.id}`, {
        name: "agent/run.execute",
        data: {
          runId: run.id,
        },
      });

      // Step 5: Track the queued event for the cron execution summary
      results.push({
        runId: run.id,
        agentId: run.agentId,
        status: "queued",
      });
    }

    // Step 6: Return a compact summary for Inngest logs and observability
    return {
      queued: results.filter((result) => result.status === "queued").length,
      results,
    };
  },
);

export const ExecuteScheduledAgent = inngest.createFunction(
  {
    id: "execute-scheduled-agent-run",
    // Run one queued agent execution whenever the cron function emits this event
    triggers: [{ event: "agent/run.execute" }],
  },
  async ({ event, step }) => {
    const runId = event.data.runId as string | undefined;

    if (!runId) {
      throw new Error("Missing runId for scheduled agent execution.");
    }

    // Step 1: Load the queued run and its agent configuration.
    const runData = await step.run(
      `load-agent-run-${runId}`,
      async () => {
        const result = await db
          .select({
            run: AgentRun,
            agentConfig: AgentConfig,
          })
          .from(AgentRun)
          .innerJoin(
            AgentConfig,
            eq(AgentRun.agentId, AgentConfig.agentId),
          )
          .where(eq(AgentRun.id, runId))
          .limit(1);

        return result[0] ?? null;
      },
    );

    if (!runData) {
      throw new Error(`Agent run ${runId} was not found.`);
    }

    const { run, agentConfig } = runData;

    try {
      // Step 2: Wait until this run's exact scheduled execution time
      await step.sleepUntil(
        `wait-for-scheduled-time-${run.id}`,
        run.scheduledFor,
      );

      // Step 3: Mark this queued run as running before execution
      const startedRun = await step.run(
        `mark-run-started-${run.id}`,
        async () => {
          const result = await db
            .update(AgentRun)
            .set({
              status: "running",
              startedAt: new Date(),
            })
            .where(
              and(
                eq(AgentRun.id, run.id),
                eq(AgentRun.status, "queued"),
              ),
            )
            .returning();

          return result[0] ?? null;
        },
      );

      // Step 4: If the run is no longer queued, another execution may have claimed it
      if (!startedRun) {
        return {
          runId: run.id,
          agentId: run.agentId,
          status: "skipped",
        };
      }

      // Step 5: Execute the agent using the existing project agent logic
      const output = await step.run(
        `execute-agent-${run.id}`,
        async () => {
          const scheduledExecutionInstruction = `
This run was triggered by Groovl AI's scheduler.
Do not create, schedule, repeat, automate, or ask how to schedule this task.
Execute only the underlying task for this single scheduled occurrence.
If the objective mentions daily, recurring, schedule, or a time, treat it as context for this execution only.
          `.trim();

          // Normalize nullable DB fields into the stricter UI agent type
          const executableAgentConfig: CreatedAgentType = {
            id: agentConfig.id,
            userEmail: agentConfig.userEmail ?? run.userEmail,
            agentId: agentConfig.agentId ?? run.agentId,
            name: agentConfig.name ?? "",
            agentImage: agentConfig.agentImage ?? "",
            description: agentConfig.description ?? "",
            instructions: [
              agentConfig.instructions ?? "",
              scheduledExecutionInstruction,
            ]
              .filter(Boolean)
              .join("\n\n"),
            objective: agentConfig.objective ?? "",
            tools: agentConfig.tools,
            skills: Array.isArray(agentConfig.skills)
              ? (agentConfig.skills as string[])
              : [],
            schedule: (agentConfig.schedule ?? {
              type: "manual",
            }) as CreatedAgentType["schedule"],
            outputFormat: agentConfig.outputFormat ?? "",
            status: agentConfig.status ?? "active",
            createdAt: String(agentConfig.createdAt),
            composioSessionId:
              agentConfig.composioSessionId ?? undefined,
          };

          return await executeAgent({
            agentConfig: executableAgentConfig,
            userEmail: run.userEmail,
            input: [
              scheduledExecutionInstruction,
              "",
              "Task to execute now:",
              executableAgentConfig.objective,
            ].join("\n"),
          });
        },
      );

      // Step 6: Persist the successful output back to the AgentRun record
      await step.run(`mark-run-completed-${run.id}`, async () => {
        await db
          .update(AgentRun)
          .set({
            status: "completed",
            output,
            completedAt: new Date(),
          })
          .where(eq(AgentRun.id, run.id));
      });

      const schedule = agentConfig.schedule as {
        type?: string;
        frequency?: string;
        time?: string;
        timezone?: string;
      } | null;

      // Step 7: For daily recurring agents, create the next scheduled run
      if (
        schedule?.type === "recurring" &&
        schedule.frequency === "daily" &&
        schedule.time
      ) {
        await step.run(`schedule-next-run-${run.id}`, async () => {
          const timezone = schedule.timezone ?? run.timezone;

          const nextRun = calculateNextDailyRun({
            time: schedule.time!,
            timezone,
            after: new Date(run.scheduledFor),
          });

          if (nextRun && !isNaN(nextRun.getTime())) {
            await db
              .insert(AgentRun)
              .values({
                agentId: run.agentId,
                userEmail: run.userEmail,
                scheduledFor: nextRun,
                timezone,
                status: "scheduled",
              })
              .onConflictDoNothing();
          }
        });
      }

      // Step 8: Return the single-run execution summary.
      return {
        runId: run.id,
        agentId: run.agentId,
        status: "completed",
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";

      // Step 9: Persist failures so the run does not stay stuck in running
      await step.run(`mark-run-failed-${run.id}`, async () => {
        await db
          .update(AgentRun)
          .set({
            status: "failed",
            error: message,
            completedAt: new Date(),
          })
          .where(eq(AgentRun.id, run.id));
      });

      // Step 10: Return failure details for the Inngest execution logs
      return {
        runId: run.id,
        agentId: run.agentId,
        status: "failed",
        error: message,
      };
    }
  },
);

// Keep the existing API route import working while using the clearer name
export const processTask = ProcessScheduledAgent;