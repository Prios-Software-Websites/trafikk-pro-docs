import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "admin" | "teacher" | "student" | "parent";

export type SessionUser = {
  id: string;
  role: Role;
  name: string;
  email: string;
};

const DEFAULT_USERS: Record<Role, SessionUser> = {
  admin: { id: "u-admin", role: "admin", name: "Anders Johansen", email: "anders@oslotrafikkskole.no" },
  teacher: { id: "t-001", role: "teacher", name: "Erik Stenberg", email: "erik@oslotrafikkskole.no" },
  student: { id: "s-001", role: "student", name: "Magnus Johansen", email: "magnus@example.com" },
  parent: { id: "p-001", role: "parent", name: "Kari Johansen", email: "kari@example.com" },
};

const Ctx = createContext<{
  user: SessionUser | null;
  setRole: (r: Role) => void;
  signOut: () => void;
}>({ user: null, setRole: () => {}, signOut: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const r = localStorage.getItem("tdp_role") as Role | null;
    if (r && DEFAULT_USERS[r]) setUser(DEFAULT_USERS[r]);
  }, []);
  const setRole = (r: Role) => {
    setUser(DEFAULT_USERS[r]);
    if (typeof window !== "undefined") localStorage.setItem("tdp_role", r);
  };
  const signOut = () => {
    setUser(null);
    if (typeof window !== "undefined") localStorage.removeItem("tdp_role");
  };
  return <Ctx.Provider value={{ user, setRole, signOut }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
