import { useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { Toaster, toast } from "sonner";
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from "@/Components/ui/sidebar";
import { Separator } from "@/Components/ui/separator";
import { Button } from "@/Components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Bell, ChevronDown, LogOut, Settings, User, Moon, Sun } from "lucide-react";
import { Link } from "@inertiajs/react";
import SidebarComponent from "@/Components/SidebarComponent";
import { useTheme } from "../Components/theme-provider";

export default function AuthenticatedLayout({
    user,
    header,
    children,
    settings,
}) {
    console.log("LAYOUT - user", user);
    console.log("LAYOUT - user", user);
    console.log("LAYOUT - settings", settings);
    const { flash } = usePage().props;
    const { setTheme, theme } = useTheme();

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    console.log("SidebarComponent user:", user);
    console.log("SidebarComponent userRole:", user?.role);

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
        <SidebarProvider>
            {/* Sidebar */}
            {user && <SidebarComponent user={user} />}

            {/* Main Content */}
            <SidebarInset>
                {/* Header */}
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 h-4"
                        />
                        {header && (
                            <div className="text-lg font-semibold text-foreground">
                                {header}
                            </div>
                        )}
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        {/* Dark Mode Toggle */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                    <span className="sr-only">Toggle theme</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setTheme("light")}>
                                    Light
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("dark")}>
                                    Dark
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("system")}>
                                    System
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* User Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="gap-2 px-3 h-auto"
                                >
                                    <Avatar className="h-7 w-7">
                                        <AvatarImage src={user?.avatar} />
                                        <AvatarFallback
                                            className={getRoleColor(user?.role)}
                                        >
                                            {getUserInitials(user?.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {user?.name}
                                        </p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
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
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 w-full overflow-auto">
                    {children}
                </main>
            </SidebarInset>

            {/* Toast Notifications */}
            <Toaster richColors position="top-right" />
        </SidebarProvider>
    );
}