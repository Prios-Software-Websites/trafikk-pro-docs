import { Navigate } from "@tanstack/react-router";
import { useAuth, type Role } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import type { ReactNode } from "react";

export function RoleGate({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (!allow.includes(user.role)) {
    const home = user.role === "admin" ? "/admin" : user.role === "teacher" ? "/larer" : user.role === "student" ? "/elev" : "/foresatt";
    return <Navigate to={home} />;
  }
  return <AppShell>{children}</AppShell>;
}
