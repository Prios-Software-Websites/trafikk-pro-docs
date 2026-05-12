import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { NotificationsPage } from "@/components/NotificationsPage";

export const Route = createFileRoute("/larer/varslinger")({
  component: () => <RoleGate allow={["teacher"]}><NotificationsPage /></RoleGate>,
});
