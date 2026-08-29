"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

const PUBLIC_PATHS = ["/", "/login", "/register"];

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && !PUBLIC_PATHS.includes(pathname)) {
      router.replace("/login");
    }
  }, [user, loading, pathname, router]);

  if (!user && !PUBLIC_PATHS.includes(pathname)) return null;

  return <>{children}</>;
}
