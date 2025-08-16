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
import {
    Package,
    Activity,
    DollarSign,
    Truck,
    Building,
    ChevronRight,
} from "lucide-react";
import { Link } from "@inertiajs/react";
import { useState } from "react";

export function MasterDataMenu({ userRole, isCollapsed }) {
    const [isOpen, setIsOpen] = useState(true);
    console.log("MasterDataMenu - userRole:", userRole);

    // Check if user has access to master data
    const hasAccess = ["admin", "manager"].includes(userRole);

    if (!hasAccess) {
        return null;
    }

    const masterDataItems = [
        {
            href: route("departments.index"),
            active: route().current("departments.*"),
            label: "Departemen",
            icon: Building,
        },
        {
            href: route("products.index"),
            active: route().current("products.*"),
            label: "Produk",
            icon: Package,
        },
        {
            href: route("cost-drivers.index"),
            active: route().current("cost-drivers.*"),
            label: "Driver Biaya",
            icon: Truck,
        },
        {
            href: route("activities.index"),
            active: route().current("activities.*"),
            label: "Aktivitas",
            icon: Activity,
        },
        {
            href: route("costs.index"),
            active: route().current("costs.*"),
            label: "Biaya",
            icon: DollarSign,
        },
    ];

    // Check if any child is active
    const isParentActive = masterDataItems.some((item) => item.active);

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Setup Master Data</SidebarGroupLabel>
            <SidebarMenu>
                <Collapsible
                    open={isOpen || isParentActive}
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
                                            <Package />
                                            <span>Master Data</span>
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                </TooltipTrigger>
                                {isCollapsed && (
                                    <TooltipContent side="right">
                                        <p>Master Data</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                {masterDataItems.map((item, index) => (
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
