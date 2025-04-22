import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/sidebar";
import UserDropdown from "@/components/user-dropdown";
import ThemeSwitcher from "@/components/theme-switcher";
import MobileNav from "@/components/mobile-nav";
import Logo from "@/components/logo";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth");
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar para desktop */}
      <Sidebar user={session.user} />
      
      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Header */}
        <header className="h-16 border-b flex items-center px-4 sticky top-0 z-10 bg-background">
          <div className="flex-1 flex items-center lg:hidden">
            <MobileNav user={session.user} />
            <div className="ml-3">
              <Logo />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <UserDropdown user={session.user} />
          </div>
        </header>
        
        {/* Conteúdo da página */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="container mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
