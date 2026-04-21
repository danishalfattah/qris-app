"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ScanLine, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/scan", icon: ScanLine, label: "Scan QR", isCenter: true },
  { href: "/profile", icon: User, label: "Profil" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-octo-gray-200 z-50">
      <div className="flex items-end justify-around px-2 pt-1 pb-[max(8px,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center -mt-5"
              >
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200",
                  "bg-gradient-to-br from-octo-red-600 to-octo-red-800",
                  isActive && "scale-110 shadow-octo-red/40 shadow-xl"
                )}>
                  <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <span className={cn(
                  "text-[10px] mt-1 font-semibold",
                  isActive ? "text-octo-red" : "text-octo-gray-500"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center py-1.5 px-3 group"
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-200",
                isActive && "bg-octo-red-light"
              )}>
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors duration-200",
                    isActive ? "text-octo-red" : "text-octo-gray-400 group-hover:text-octo-gray-600"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span className={cn(
                "text-[10px] mt-0.5 transition-colors duration-200",
                isActive ? "text-octo-red font-semibold" : "text-octo-gray-500 group-hover:text-octo-gray-600"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
