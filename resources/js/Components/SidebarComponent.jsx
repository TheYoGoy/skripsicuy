import { useEffect, useState } from "react";
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarRail,
    useSidebar, // <--- Tambahkan ini
} from "@/Components/ui/sidebar";
import { Separator } from "@/Components/ui/separator";
import { DashboardMenu } from "@/Components/sidebar/DashboardMenu";
import { MasterDataMenu } from "@/Components/sidebar/MasterDataMenu";
import { ProductionInputMenu } from "@/Components/sidebar/ProductionInputMenu";
import { ReportsMenu } from "@/Components/sidebar/ReportsMenu";
import { UserManagementMenu } from "@/Components/sidebar/UserManagementMenu";
import { NavUser } from "@/Components/NavUser";
import { TeamSwitcher } from "@/Components/TeamSwitcher";

const SidebarComponent = ({ user, settings }) => {
    // Dapatkan state dari SidebarProvider
    const { state: sidebarState } = useSidebar(); // <--- BARIS KRUSIAL
    const isCollapsed = sidebarState === "collapsed"; // <--- Tentukan isCollapsed dari sidebarState

    // Debug log (bisa dihapus setelah yakin berfungsi)
    useEffect(() => {
        console.log("Sidebar collapsed:", isCollapsed);
    }, [isCollapsed]);

    if (!user || !user.role) {
    return <div>Loading sidebar...</div>;
}



    const userRole = user.role;

    useEffect(() => {
    console.log("SIDEBAR - user =", user);
    console.log("SIDEBAR - userRole =", user?.role);
}, [user]);




    return (
        <Sidebar collapsible="icon" className="border-none">
            <SidebarHeader>
                <TeamSwitcher/>
            </SidebarHeader>
            <Separator className="mb-2" />
            <SidebarContent>
                <DashboardMenu userRole={userRole} isCollapsed={isCollapsed} />
                <MasterDataMenu userRole={userRole} isCollapsed={isCollapsed} />
                <ProductionInputMenu
                    userRole={userRole}
                    isCollapsed={isCollapsed}
                />
                <ReportsMenu userRole={userRole} isCollapsed={isCollapsed} />
            </SidebarContent>
            {/* UserManagementMenu dan NavUser mungkin perlu berada di dalam SidebarContent atau memiliki styling khusus */}
            {/* Jika UserManagementMenu dimaksudkan sebagai bagian dari menu utama, ia harusnya di dalam SidebarContent */}
            <UserManagementMenu userRole={userRole} isCollapsed={isCollapsed} />
            <Separator className="mb-2" />
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
};

export default SidebarComponent;
