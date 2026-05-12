import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { SmsComposer } from "@/components/SmsComposer";

export const Route = createFileRoute("/admin/sms")({
  component: () => <RoleGate allow={["admin"]}><SmsComposer /></RoleGate>,
});
