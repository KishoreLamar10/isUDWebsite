import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getServerSession } from "next-auth";
import "./globals.css";
import Providers from "@/components/Providers";
import { authOptions } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "isUD - Universal Design Platform",
  description: "Innovative solutions for Universal Design",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <Providers session={session}>{children}</Providers>
        {/* Hidden container populated by ChecklistPrintModal before window.print() */}
        <div id="checklist-print-root" aria-hidden="true" />
      </body>
    </html>
  );
}


