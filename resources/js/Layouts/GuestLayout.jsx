import React from 'react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
            {/* Hapus properti kartu dari sini, hanya biarkan wadah dasar */}
            <div className="w-full sm:max-w-md"> {/* Hapus bg-white, shadow-md, px-6 py-4, sm:rounded-lg, overflow-hidden */}
                {children}
            </div>
        </div>
    );
}