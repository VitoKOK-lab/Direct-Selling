import { notFound, redirect } from "next/navigation";
import { PortalShell } from "@/components/portal-shell";
import { getDemoSession } from "@/lib/auth";
import type { Role } from "@/types/domain";

const roles: Role[] = ["member", "vendor", "admin", "finance"];

export default async function PortalPage({ params }: { params: Promise<{ role: string; section?: string[] }> }) {
  const { role, section = [] } = await params;
  if (!roles.includes(role as Role)) notFound();
  const session = await getDemoSession();
  if (!session) redirect(`/login?next=/${role}/${section.join("/")}`);
  if (session.role !== role) redirect(`/${session.role}`);
  return <PortalShell account={session} role={role as Role} section={section[0] ?? "overview"} />;
}
