import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Header from "@/components/Header";
import InvitationBanner from "@/components/InvitationBanner";
import ProfileUpdateForm from "@/components/ProfileUpdateForm";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <InvitationBanner />
      <Header />
      <main className="flex-grow pt-8">
        <ProfileUpdateForm />
      </main>
    </div>
  );
}
