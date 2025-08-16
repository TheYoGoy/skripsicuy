import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Separator } from "@/Components/ui/separator";
import {
    Users,
    Package,
    Activity,
    Building,
    DollarSign,
    Truck,
    ClipboardList,
    BarChart3,
    TrendingUp,
    Calendar,
    Clock,
} from "lucide-react";

// Import komponen grafik yang baru dibuat
import ActivityCostPieChart from "@/Components/charts/ActivityCostPieChart";
import ProductCostBarChart from "@/Components/charts/ProductCostBarChart";

export default function Dashboard({ auth, stats, dashboardData, settings }) {
    // --- DEBUGGING: Log data yang diterima oleh komponen Dashboard ---
    // Baris ini akan mencetak data ke konsol browser untuk debugging.
    // Anda bisa menghapusnya setelah grafik tampil dengan benar.

    console.log("auth:", auth);
console.log("auth.user:", auth?.user);
    console.log("Dashboard Props:", { auth, stats, dashboardData });
    console.log(
        "Activity Cost Breakdown:",
        dashboardData?.activity_cost_breakdown
    );
    console.log(
        "Product Cost Breakdown:",
        dashboardData?.product_cost_breakdown
    );
    // --- END DEBUGGING ---

    // Helper function to get greeting based on time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Selamat Pagi";
        if (hour < 15) return "Selamat Siang";
        if (hour < 18) return "Selamat Sore";
        return "Selamat Malam";
    };

    // Stats cards configuration
    const statsCards = [
        {
            title: "Total Users",
            value: stats?.total_users || 0,
            icon: Users,
            description: "Pengguna terdaftar",
            color: "text-blue-600",
            bgColor: "bg-blue-500",
            iconColor: "text-blue-500",
        },
        {
            title: "Total Products",
            value: stats?.total_products || 0,
            icon: Package,
            description: "Produk aktif",
            color: "text-green-600",
            bgColor: "bg-green-500",
            iconColor: "text-green-500",
        },
        {
            title: "Total Activities",
            value: stats?.total_activities || 0,
            icon: Activity,
            description: "Aktivitas terdaftar",
            color: "text-orange-600",
            bgColor: "bg-orange-500",
            iconColor: "text-orange-500",
        },
        {
            title: "Total Departments",
            value: stats?.total_departments || 0,
            icon: Building,
            description: "Departemen aktif",
            color: "text-purple-600",
            bgColor: "bg-purple-500",
            iconColor: "text-purple-500",
        },
    ];

    // Quick actions configuration based on user role
    const getQuickActions = (userRole) => {
        const allActions = [
            {
                title: "Kelola Users",
                description: "Manajemen pengguna sistem",
                href: route("users.index"),
                icon: Users,
                color: "bg-blue-500 hover:bg-blue-600",
                roles: ["admin"],
            },
            {
                title: "Kelola Produk",
                description: "Manajemen data produk",
                href: route("products.index"),
                icon: Package,
                color: "bg-green-500 hover:bg-green-600",
                roles: ["admin", "manager"],
            },
            {
                title: "Kelola Aktivitas",
                description: "Manajemen aktivitas produksi",
                href: route("activities.index"),
                icon: Activity,
                color: "bg-orange-500 hover:bg-orange-600",
                roles: ["admin", "manager"],
            },
            {
                title: "Kelola Departemen",
                description: "Manajemen departemen",
                href: route("departments.index"),
                icon: Building,
                color: "bg-purple-500 hover:bg-purple-600",
                roles: ["admin", "manager"],
            },
            {
                title: "Kelola Biaya",
                description: "Manajemen data biaya",
                href: route("costs.index"),
                icon: DollarSign,
                color: "bg-red-500 hover:bg-red-600",
                roles: ["admin", "manager"],
            },
            {
                title: "Cost Drivers",
                description: "Manajemen driver biaya",
                href: route("cost-drivers.index"),
                icon: Truck,
                color: "bg-indigo-500 hover:bg-indigo-600",
                roles: ["admin", "manager"],
            },
            {
                title: "Input Produksi",
                description: "Pencatatan data produksi",
                href: route("productions.index"),
                icon: ClipboardList,
                color: "bg-pink-500 hover:bg-pink-600",
                roles: ["admin", "manager", "operator"],
            },
            {
                title: "Laporan ABC",
                description: "Laporan Activity Based Costing",
                href: route("abc-reports.index"),
                icon: BarChart3,
                color: "bg-gray-500 hover:bg-gray-600",
                roles: ["admin", "manager"],
            },
        ];

        return allActions.filter((action) => action.roles.includes(userRole));
    };

    const userRole =
        auth && auth.user && auth.user.role ? auth.user.role : "guest";

    const quickActions = getQuickActions(userRole);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex gap-4 items-center justify-between">
                    <h2 className="font-semibold text-xl leading-tight">
                        Dashboard
                    </h2>
                    <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                    >
                        <Clock className="h-3 w-3" />
                        {new Date().toLocaleDateString("id-ID", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </Badge>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Welcome Section */}
                <Card className="relative overflow-hidden bg-cyan-900">
                    {/* Icon background besar di kanan */}
                    <TrendingUp className="absolute right-4 top-1/2 -translate-y-1/2 h-32 w-32 text-white opacity-10" />

                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex gap-4 items-center z-10 relative">
                                {/* Icon kecil di kiri */}
                                <TrendingUp className="h-8 w-8 text-white" />
                                <div>
                                    <CardTitle className="text-2xl font-bold text-white">
                                        {getGreeting()},{" "}
                                        {auth?.user?.name || "User"}!
                                    </CardTitle>
                                    <CardDescription className="text-base text-white">
                                        Selamat datang di Sistem ABC Costing
                                        Sudut Timur
                                    </CardDescription>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statsCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Card
                                key={index}
                                className={`hover:shadow-md transition-shadow ${stat.bgColor}`}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="text-white">
                                            <p className="text-lg text-white font-bold ">
                                                {stat.title}
                                            </p>
                                            <p
                                                className={`text-3xl font-bold `}
                                            >
                                                {stat.value.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-white">
                                                {stat.description}
                                            </p>
                                        </div>
                                        <div className={`p-3 rounded-full `}>
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <Separator />

                {/* Charts Section - Tambahkan pengecekan untuk dashboardData dan properti turunannya */}
                {dashboardData &&
                Array.isArray(dashboardData.activity_cost_breakdown) &&
                Array.isArray(dashboardData.product_cost_breakdown) ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Chart 1: Distribusi Biaya per Aktivitas (Pie Chart) */}
                        <ActivityCostPieChart
                            data={dashboardData.activity_cost_breakdown || []}
                        />

                        {/* Chart 2: Biaya Produksi per Produk (Bar Chart) */}
                        <ProductCostBarChart
                            data={dashboardData.product_cost_breakdown || []}
                        />
                    </div>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Data Grafik Tidak Tersedia</CardTitle>
                            <CardDescription>
                                Tidak dapat memuat data grafik. Pastikan data
                                ABC telah dihitung di backend dan memiliki
                                format yang benar.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center text-muted-foreground py-10">
                                Periksa konfigurasi backend atau ketersediaan
                                data.
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Separator />

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Menu Utama
                        </CardTitle>
                        <CardDescription>
                            Akses cepat ke fitur-fitur utama sistem berdasarkan
                            role Anda
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {quickActions.map((action, index) => {
                                const Icon = action.icon;
                                return (
                                    <Button
                                        key={index}
                                        asChild
                                        variant="outline"
                                        className="h-auto p-4 flex flex-col items-center gap-3 hover:shadow-md transition-all duration-200 border-2 hover:border-primary/50"
                                    >
                                        <Link href={action.href}>
                                            <div
                                                className={`p-3 rounded-full ${action.color} text-white`}
                                            >
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <div className="text-center">
                                                <h3 className="font-semibold text-sm">
                                                    {action.title}
                                                </h3>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {action.description}
                                                </p>
                                            </div>
                                        </Link>
                                    </Button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity or Additional Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Informasi Sistem
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Sistem berjalan normal</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>Database terkoneksi</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <span>
                                    Role:{" "}
                                    {auth?.user?.role || "Belum ditentukan"}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
