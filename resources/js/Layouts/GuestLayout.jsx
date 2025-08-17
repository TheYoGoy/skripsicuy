import React from "react";

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center pt-6 sm:justify-center sm:pt-0 relative">
            {/* Background container - positioning yang lebih baik */}
            <div
                className="fixed inset-0 z-0"
                style={{
                    backgroundImage: "url('/background.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "30% center", // posisi ke kiri dikit biar coffee shop keliatan
                    backgroundRepeat: "no-repeat",
                }}
            ></div>

            {/* Overlay yang sangat terang */}
            <div className="fixed inset-0 bg-black/10 z-10"></div>

            {/* Content wrapper */}
            <div className="w-full sm:max-w-md px-4 relative z-20">
                {children}
            </div>
        </div>
    );
}
