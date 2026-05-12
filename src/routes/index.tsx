import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) return <Navigate to="/login" />;
  const home = user.role === "admin" ? "/admin" : user.role === "teacher" ? "/larer" : user.role === "student" ? "/elev" : "/foresatt";
  navigate({ to: home });
  return null;
}
