import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton, // Akan digunakan untuk setiap item menu
    SidebarMenuItem, // Akan digunakan sebagai wrapper untuk SidebarMenuButton
} from "@/Components/ui/sidebar";
// Tidak perlu lagi mengimpor Collapsible terkait komponen ini
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/Components/ui/tooltip";
import { ClipboardList, Activity, Truck } from "lucide-react"; // Menghilangkan ChevronRight karena tidak ada dropdown
import { Link } from "@inertiajs/react";
// Tidak perlu lagi useState untuk collapsible

export function ProductionInputMenu({ userRole, isCollapsed }) {
    // State isOpen tidak lagi diperlukan karena tidak ada collapsible
    // const [isOpen, setIsOpen] = useState(false);

    // Check if user has access to production input
    const hasAccess = ["admin", "manager", "operator"].includes(userRole);

    if (!hasAccess) {
        return null;
    }
console.log("ProductionInputMenu - userRole:", userRole);
    const productionInputItems = [
        {
            href: route("activity-cost-driver-usages.index"),
            active: route().current("activity-cost-driver-usages.*"),
            label: "Penggunaan Sumber Daya",
            icon: Truck,
        },
        {
            href: route("product-activity-usages.index"),
            active: route().current("product-activity-usages.*"),
            label: "Penggunaan Aktivitas",
            icon: Activity,
        },
        {
            href: route("productions.index"),
            active: route().current("productions.*"),
            label: "Pencatatan Produksi",
            icon: ClipboardList,
        },        
    ];

    // isParentActive juga tidak relevan lagi jika tidak ada parent menu yang menjadi toggle
    // const isParentActive = productionInputItems.some((item) => item.active);

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Operasional Harian</SidebarGroupLabel>{" "}
            {/* Label grup "Production" */}
            <SidebarMenu>
                {/* Langsung loop dan render setiap item sebagai SidebarMenuItem */}
                {productionInputItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                        {" "}
                        {/* Gunakan href sebagai key yang unik */}
                        <TooltipProvider>
                            <Tooltip delayDuration={0}>
                                {" "}
                                {/* Delay tooltip 0ms untuk respons cepat */}
                                <TooltipTrigger asChild>
                                    {/* Gunakan SidebarMenuButton langsung membungkus Link */}
                                    <SidebarMenuButton
                                        asChild
                                        isActive={item.active} // isActive diterapkan langsung ke tombol
                                    >
                                        <Link href={item.href}>
                                            <item.icon className="h-4 w-4" />{" "}
                                            {/* Pastikan ikon memiliki ukuran */}
                                            {!isCollapsed && (
                                                <span>{item.label}</span>
                                            )}{" "}
                                            {/* Label hanya ditampilkan jika sidebar tidak diciutkan */}
                                        </Link>
                                    </SidebarMenuButton>
                                </TooltipTrigger>
                                {isCollapsed && ( // Tooltip hanya muncul jika sidebar diciutkan
                                    <TooltipContent side="right">
                                        <p>{item.label}</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
