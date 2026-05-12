import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { SmsComposer } from "@/components/SmsComposer";

export const Route = createFileRoute("/foresatt/sms")({
  component: () => <RoleGate allow={["parent"]}><SmsComposer /></RoleGate>,
});
