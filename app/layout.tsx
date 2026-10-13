import type { Metadata } from "next";
import "./globals.css";

const title = "NurseForgeHK 護士鍛造工場";
const description =
  "護士小物訂購：膠紙座、防塵蓋、Clicker、鎖匙扣。全店滿 $200 順豐站／智能櫃免運。";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    locale: "zh_HK",
    type: "website",
    siteName: "NurseForgeHK",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-HK" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
