import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { NotificationsPage } from "@/components/NotificationsPage";

export const Route = createFileRoute("/elev/varslinger")({
  component: () => <RoleGate allow={["student"]}><NotificationsPage /></RoleGate>,
});
