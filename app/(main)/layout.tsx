import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-black">
        <header className="flex h-14 shrink-0 items-center border-b border-white/10 bg-black/50 backdrop-blur-xl">
          <div className="flex w-full items-center px-4">
            <SidebarTrigger className="-ml-1 text-white/70 hover:text-white hover:bg-white/10" />
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}