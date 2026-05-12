import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { NotificationsPage } from "@/components/NotificationsPage";

export const Route = createFileRoute("/foresatt/varslinger")({
  component: () => <RoleGate allow={["parent"]}><NotificationsPage /></RoleGate>,
});
