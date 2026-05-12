import { createFileRoute } from "@tanstack/react-router";
import { Route as Root } from "./admin.kalender";
import { RoleGate } from "@/components/RoleGate";

export const Route = createFileRoute("/larer/kalender")({
  component: () => <RoleGate allow={["teacher"]}><Root.options.component! as any /></RoleGate>,
});
