'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, LayoutGrid, User, Image, Settings, Receipt } from 'lucide-react';

const MENU_ITEMS = [
    { href: '/dashboard', icon: LayoutDashboard },
    { href: '/dashboard/products', icon: LayoutGrid },
    { href: '/dashboard/orders', icon: Receipt },
    { href: '/dashboard/customers', icon: User },
    { href: '/dashboard/banners', icon: Image },
];

export const AdminSidebar = () => {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-[70px] flex-col bg-[#4CE2D1] shadow-lg hidden lg:flex z-50 transition-all duration-300">
            {/* Logo area - Simple 'h' style logo from image */}
            <div className="flex h-20 items-center justify-center pt-2">
                <Link href="/" className="flex items-center justify-center w-10 h-10 hover:opacity-80 transition-opacity">
                   {/* Simulating the black 'h' logo from the image */}
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black">
                       <path d="M5 3V21M5 12C9 12 11 10 11 6V3H19C19.5523 3 20 3.44772 20 4V20C20 20.5523 19.5523 21 19 21H11C9 21 5 19 5 12Z" fill="currentColor" opacity="0.9"/>
                   </svg>
                </Link>
            </div>

            {/* Navigation Links - Centered icons */}
            <nav className="flex-1 flex flex-col items-center gap-4 mt-8">
                {MENU_ITEMS.map((item) => {
                    // Match Exact Dashboard Path or subpaths for active state
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                                isActive
                                    ? 'bg-black text-[#4CE2D1] shadow-md' // Black active background like in image
                                    : 'text-black/70 hover:bg-black/10 hover:text-black'
                            }`}
                        >
                            <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Settings Icon */}
            <div className="pb-6 flex flex-col items-center">
                <Link
                    href="/dashboard/settings"
                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                        pathname === '/dashboard/settings'
                            ? 'bg-black text-[#4CE2D1] shadow-md'
                            : 'text-black/70 hover:bg-black/10 hover:text-black'
                    }`}
                >
                    <Settings className="h-5 w-5" strokeWidth={2} />
                </Link>
            </div>
        </aside>
    );
};
