import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/Components/ui/sidebar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/Components/ui/tooltip";
import { LayoutDashboard } from "lucide-react";
import { Link } from "@inertiajs/react";

export function DashboardMenu({ userRole, isCollapsed }) {
    // Check if user has access to dashboard
    const hasAccess = ["admin", "manager"].includes(userRole);
console.log("DashboardMenu - userRole:", userRole);
    if (!hasAccess) {
        return null;
    }

    const dashboardItem = {
        href: route("dashboard"),
        active: route().current("dashboard"),
        label: "Dashboard",
        icon: LayoutDashboard,
    };

    const Icon = dashboardItem.icon;

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Overview</SidebarGroupLabel>
            <SidebarMenu>
                <SidebarMenuItem >
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <SidebarMenuButton
                                    asChild
                                    isActive={dashboardItem.active}
                                >
                                    <Link href={dashboardItem.href} className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors ">
                                        <Icon className="w-4 h-4" />
                                        <span>{dashboardItem.label}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </TooltipTrigger>
                            {isCollapsed && (
                                <TooltipContent side="right">
                                    <p>{dashboardItem.label}</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    );
}
