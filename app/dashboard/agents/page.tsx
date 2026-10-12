import React, { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CreateAgent from "@/components/custom/agents/CreateAgent";
import MyAgents from "@/components/custom/agents/MyAgents";

function AgentsPage() {
    return (
        <div className="w-full flex justify-center ">
            <div className="w-full max-w-4xl px-6 pt-18 pb-16">
            <Tabs defaultValue="create-agent" className="w-full">
                <TabsList>
                    <TabsTrigger value="create-agent">Create Agent</TabsTrigger>
                    <TabsTrigger value="my-agents">My Agents</TabsTrigger>
                </TabsList>
                <TabsContent value="create-agent">
                    <Suspense fallback={<div className="py-12 text-center text-muted-foreground text-sm">Loading agent builder...</div>}>
                        <CreateAgent/>
                    </Suspense>
                </TabsContent>
                <TabsContent value="my-agents">
                    <MyAgents />
                </TabsContent>
            </Tabs>
            </div>
        </div>
    )
}

export default AgentsPage