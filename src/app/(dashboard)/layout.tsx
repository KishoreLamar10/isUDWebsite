import Header from "@/components/Header";
import InvitationBanner from "@/components/InvitationBanner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <InvitationBanner />
      <Header />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}
