import AppSidebar from "@/components/Sidebar"
import { Topbar } from "@/components/Topbar"
import { SidebarProvider } from "@/components/ui/sidebar"

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <section className="h-dvh flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 p-4 md:p-6 lg:p-8 animate-fade-in">
            {children}
          </main>
        </div>
      </section>
    </SidebarProvider>
  )
}

export default ProtectedLayout
