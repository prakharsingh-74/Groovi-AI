import { auth } from "@clerk/nextjs/server";
import { AppSidebar } from "@/components/custom/dashboard/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";

async function Dashboardlayout({ children }: { children: React.ReactNode }) {
    await auth.protect();

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarTrigger />
            <div className="w-full">{children}</div>
        </SidebarProvider>
    );
}

export default Dashboardlayout;