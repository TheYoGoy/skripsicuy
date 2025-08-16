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
import { Users } from "lucide-react";
import { Link } from "@inertiajs/react";

export function UserManagementMenu({ userRole, isCollapsed }) {
    // Check if user has access to user management (admin only)
    const hasAccess = userRole === "admin";
console.log("UserManagement - userRole:", userRole);
    if (!hasAccess) {
        return null;
    }

    const userManagementItem = {
        href: route("users.index"),
        active: route().current("users.*"),
        label: "Manajemen Pengguna",
        icon: Users,
    };

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Manajemen</SidebarGroupLabel>
            <SidebarMenu>
                <SidebarMenuItem>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <SidebarMenuButton
                                    asChild
                                    isActive={userManagementItem.active}
                                >
                                    <Link href={userManagementItem.href}>
                                        <userManagementItem.icon />
                                        <span>{userManagementItem.label}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </TooltipTrigger>
                            {isCollapsed && (
                                <TooltipContent side="right">
                                    <p>{userManagementItem.label}</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    );
}
