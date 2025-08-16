import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/Components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Badge } from "@/Components/ui/badge";
import { ChevronsUpDown, LogOut, Settings, User } from "lucide-react";
import { Link } from "@inertiajs/react";

export function NavUser({ user }) {
    const { isMobile } = useSidebar();

    // Get role color for AvatarFallback
    const getRoleColor = (role) => {
        switch (role) {
            case "admin":
                return "bg-red-500 text-white";
            case "manager":
                return "bg-blue-500 text-white";
            case "operator":
                return "bg-green-500 text-white";
            default:
                return "bg-gray-500 text-white";
        }
    };

    // Get user initials for AvatarFallback
    const getUserInitials = (name) => {
        return (
            name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "U"
        );
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage
                                    src={user?.avatar}
                                    alt={user?.name}
                                />
                                <AvatarFallback
                                    className={`rounded-lg ${getRoleColor(
                                        user?.role
                                    )}`}
                                >
                                    {getUserInitials(user?.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    {user?.name}
                                </span>
                                <Badge
                                    variant="secondary"
                                    className="text-xs px-2 py-0.5 w-fit"
                                >
                                    {user?.role}
                                </Badge>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage
                                        src={user?.avatar}
                                        alt={user?.name}
                                    />
                                    <AvatarFallback
                                        className={`rounded-lg ${getRoleColor(
                                            user?.role
                                        )}`}
                                    >
                                        {getUserInitials(user?.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        {user?.name}
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        {user?.email}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        
                        <DropdownMenuItem asChild>
                            <Link
                                href={route("logout")}
                                method="post"
                                as="button"
                                className="flex items-center gap-2 text-destructive cursor-pointer w-full"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
