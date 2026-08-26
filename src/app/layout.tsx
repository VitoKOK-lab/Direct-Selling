import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "LUXKEY 示範驗證系統", template: "%s｜LUXKEY" },
  description: "LUXKEY 會員商城暨十代分潤制度示範驗證系統",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>
        <a className="skip-link" href="#main-content">跳至主要內容</a>
        {children}
      </body>
    </html>
  );
}
