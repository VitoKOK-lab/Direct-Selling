import type { DemoAccount, Role } from "@/types/domain";
import { MemberViews } from "@/components/views/member-views";
import { VendorViews } from "@/components/views/vendor-views";
import { AdminViews } from "@/components/views/admin-views";
import { FinanceViews } from "@/components/views/finance-views";

export function RoleView({ role, section, account }: { role: Role; section: string; account: DemoAccount }) {
  if (role === "member") return <MemberViews section={section} account={account} />;
  if (role === "vendor") return <VendorViews section={section} account={account} />;
  if (role === "admin") return <AdminViews section={section} account={account} />;
  return <FinanceViews section={section} account={account} />;
}
