import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { SmsComposer } from "@/components/SmsComposer";

export const Route = createFileRoute("/elev/sms")({
  component: () => <RoleGate allow={["student"]}><SmsComposer /></RoleGate>,
});
