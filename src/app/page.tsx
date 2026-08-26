import { redirect } from "next/navigation";
import { getDemoSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getDemoSession();
  redirect(session ? `/${session.role}` : "/login");
}
