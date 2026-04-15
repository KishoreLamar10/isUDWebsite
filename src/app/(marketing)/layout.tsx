import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MarketingHeader />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
