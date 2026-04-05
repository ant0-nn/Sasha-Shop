import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/shared/providers/query-provider";

import { Header } from "@/widgets/header";
import { Footer } from "@/widgets/footer";
import { getShopSettingsServer } from '@/entities/shop-settings/api/shop-settings.api';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getShopSettingsServer();

  return {
    title: `${settings.storeName} | Premium Auto Parts`,
    description: settings.seoDescription,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <QueryProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
