import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { SmsComposer } from "@/components/SmsComposer";

export const Route = createFileRoute("/larer/sms")({
  component: () => <RoleGate allow={["teacher"]}><SmsComposer /></RoleGate>,
});
