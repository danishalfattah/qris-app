"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showInfo?: boolean;
  onInfoClick?: () => void;
  transparent?: boolean;
  light?: boolean;
  className?: string;
}

export default function Header({
  title,
  showBack = false,
  showInfo = false,
  onInfoClick,
  transparent = false,
  light = true,
  className,
}: HeaderProps) {
  const router = useRouter();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex items-center justify-between px-4 py-3",
        !transparent && "octo-gradient",
        transparent && "bg-transparent",
        className
      )}
    >
      <div className="w-10">
        {showBack && (
          <button
            onClick={() => router.back()}
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
              light
                ? "text-white hover:bg-white/20"
                : "text-octo-gray-800 hover:bg-black/5"
            )}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      <h1
        className={cn(
          "text-base font-semibold",
          light ? "text-white" : "text-octo-gray-900"
        )}
      >
        {title}
      </h1>

      <div className="w-10 flex justify-end">
        {showInfo && (
          <button
            onClick={onInfoClick}
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
              light
                ? "text-white hover:bg-white/20"
                : "text-octo-gray-800 hover:bg-black/5"
            )}
          >
            <Info className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
}
