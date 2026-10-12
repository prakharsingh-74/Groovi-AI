'use client'
import { Progress } from "@/components/ui/progress"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { UserDetailContext } from "@/context/UserDetailContext"
import { UserButton } from "@clerk/nextjs"
import { AppWindow, Blocks, Bot, CreditCard, Layers, Play, Crown } from "lucide-react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { useContext } from "react"

export function AppSidebar() {

  const path=usePathname();
  const {userDetail, setUserDetail}=useContext(UserDetailContext);
  const router=useRouter();

  const isPro = userDetail?.plan === "pro" || userDetail?.isPro;
  const agentCount = Number(userDetail?.agentCount || 0);
  const agentProgress = isPro ? 100 : Math.min(100, Math.round((agentCount / 3) * 100));

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row gap-2.5 items-center px-4 py-4">
        <Image src="/logo.svg" alt="logo" width={40} height={40} />
        <h2 className="font-semibold text-lg text-slate-900">Groovi AI</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarMenuButton onClick={()=>router.push('/dashboard')} className={`h-12 gap-3 hover:bg-slate-100 ${path==('/dashboard')?'bg-slate-100':null}`}>
                <div className="flex h-9 w-8 shrink-0 bg-blue-100 items-center justify-center rounded-lg">
                    <AppWindow className="h-[18px] w-[18px] text-blue-900"/>
                </div>
                <span>Dashboard</span>
            </SidebarMenuButton>

            <SidebarMenuButton onClick={()=>router.push('/dashboard/agents')} className={`h-12 gap-3 hover:bg-slate-100 ${path==('/dashboard/agents')?'bg-slate-100':null}`}>
                <div className="flex h-9 w-8 shrink-0 bg-green-100 items-center justify-center rounded-lg">
                    <Bot className="h-[18px] w-[18px] text-green-900"/>
                </div>
                <span>Agents</span>
            </SidebarMenuButton>

            <SidebarMenuButton onClick={()=>router.push('/dashboard/runs')} className={`h-12 gap-3 hover:bg-slate-100 ${path==('/dashboard/runs')?'bg-slate-100':null}`}>
                <div className="flex h-9 w-8 shrink-0 bg-red-100 items-center justify-center rounded-lg">
                    <Play className="h-[18px] w-[18px] text-red-900"/>
                </div>
                <span>Runs</span>
            </SidebarMenuButton>

            <SidebarMenuButton onClick={()=>router.push('/dashboard/integrations')} className={`h-12 gap-3 hover:bg-slate-100 ${path==('/dashboard/integrations')?'bg-slate-100':null}`}>
                <div className="flex h-9 w-8 shrink-0 bg-purple-100 items-center justify-center rounded-lg">
                    <Blocks className="h-[18px] w-[18px] text-purple-900"/>
                </div>
                <span>Integrations</span>
            </SidebarMenuButton>

            <SidebarMenuButton onClick={()=>router.push('/dashboard/templates')} className={`h-12 gap-3 hover:bg-slate-100 ${path==('/dashboard/templates')?'bg-slate-100':null}`}>
                <div className="flex h-9 w-8 shrink-0 bg-orange-100 items-center justify-center rounded-lg">
                    <Layers className="h-[18px] w-[18px] text-orange-900"/>
                </div>
                <div className="flex items-center justify-between flex-1">
                    <span>Templates</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                        PRO
                    </span>
                </div>
            </SidebarMenuButton>

            <SidebarMenuButton onClick={()=>router.push('/dashboard/billing')} className={`h-12 gap-3 hover:bg-slate-100 ${path==('/dashboard/billing')?'bg-slate-100':null}`}>
                <div className="flex h-9 w-8 shrink-0 bg-emerald-100 items-center justify-center rounded-lg">
                    <CreditCard className="h-[18px] w-[18px] text-emerald-900"/>
                </div>
                <span>Billing</span>
            </SidebarMenuButton>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-3 border rounded-xl flex gap-2 flex-col bg-slate-50/50 dark:bg-slate-900/40">
            <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-300">Agents Limit</span>
                <span className={!isPro && agentCount >= 3 ? "text-amber-600 font-bold" : "text-slate-900 dark:text-white"}>
                    {isPro ? `${agentCount} / Unlimited` : `${agentCount} / 3`}
                </span>
            </div>
            <Progress value={agentProgress} className="h-1.5" />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-slate-200/60 dark:border-slate-800">
                <span>Plan:</span>
                <span className={`font-semibold ${isPro ? 'text-blue-600 dark:text-blue-400 flex items-center gap-1' : 'text-slate-600 dark:text-slate-400'}`}>
                    {isPro && <Crown className="w-3 h-3 text-amber-500" />}
                    {isPro ? 'Groovi Pro' : 'Free Tier'}
                </span>
            </div>
        </div>

        <div className="flex items-center p-2 mt-1 gap-2.5">
            <UserButton/>
            <div className="flex flex-col min-w-0 flex-1">
                <span className="truncate text-sm font-medium">{userDetail?.name}</span>
                <span className="text-[11px] text-muted-foreground truncate">{userDetail?.email}</span>
            </div>
            {isPro && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white shrink-0">
                    PRO
                </span>
            )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}