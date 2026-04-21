"use client";

import { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";
import BottomNav from "./BottomNav";

interface AppShellProps {
  children: ReactNode;
  showNav?: boolean;
}

export default function AppShell({ children, showNav = true }: AppShellProps) {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace("/login");
    }
  }, [session, isLoading, router]);

  // Show loading spinner while checking auth state
  if (isLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="Memuat..." />
      </div>
    );
  }

  return (
    <div className={`min-h-dvh bg-background${showNav ? " pb-nav" : ""}`}>
      {children}
      {showNav && <BottomNav />}
    </div>
  );
}
