import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { Route as Admin } from "./admin.meldinger";

export const Route = createFileRoute("/larer/meldinger")({
  component: () => <RoleGate allow={["teacher"]}><Admin.options.component! as any /></RoleGate>,
});
