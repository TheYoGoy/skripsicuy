import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/Components/ui/sidebar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/Components/ui/collapsible";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/Components/ui/tooltip";
import { BarChart3, Split, ChevronRight } from "lucide-react";
import { Link } from "@inertiajs/react";
import { useState } from "react";

export function ReportsMenu({ userRole, isCollapsed }) {
    const [isOpen, setIsOpen] = useState(true);

    // Check if user has access to reports
    const hasAccess = ["admin", "manager"].includes(userRole);
    console.log("ReportsMenu - userRole:", userRole);

    if (!hasAccess) {
        return null;
    }

    const reportsItems = [
        {
            href: route("cost-activity-allocations.index"),
            active: route().current("cost-activity-allocations.*"),
            label: "Alokasi Biaya",
            icon: Split,
        },
        {
            href: route("abc-reports.index"),
            active: route().current("abc-reports.*"),
            label: "Laporan ABC",
            icon: BarChart3,
        },
    ];

    // Check if any child is active
    const isParentActive = reportsItems.some((item) => item.active);

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Perhitungan & Pelaporan</SidebarGroupLabel>
            <SidebarMenu>
                <Collapsible
                    open={isOpen}
                    onOpenChange={setIsOpen}
                    className="group/collapsible"
                >
                    <SidebarMenuItem>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            isActive={isParentActive}
                                        >
                                            <BarChart3 />
                                            <span>Perhitungan & Laporan</span>
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                </TooltipTrigger>
                                {isCollapsed && (
                                    <TooltipContent side="right">
                                        <p>Perhitungan & Laporan</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                {reportsItems.map((item, index) => (
                                    <SidebarMenuSubItem key={index}>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={item.active}
                                        >
                                            <Link href={item.href}>
                                                <item.icon />
                                                <span>{item.label}</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            </SidebarMenu>
        </SidebarGroup>
    );
}
