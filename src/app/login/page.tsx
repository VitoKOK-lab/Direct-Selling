import { redirect } from "next/navigation";
import { getDemoSession } from "@/lib/auth";
import { LoginPanel } from "@/components/login-panel";

export const metadata = { title: "測試登入" };

export default async function LoginPage() {
  const session = await getDemoSession();
  if (session) redirect(`/${session.role}`);
  return <LoginPanel />;
}
