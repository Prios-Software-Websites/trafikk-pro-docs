import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { NotificationsPage } from "@/components/NotificationsPage";

export const Route = createFileRoute("/admin/varslinger")({
  head: () => ({ meta: [{ title: "Varslinger — Kjøreflyt" }] }),
  component: () => <RoleGate allow={["admin"]}><NotificationsPage /></RoleGate>,
});
