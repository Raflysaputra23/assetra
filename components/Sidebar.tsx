"use client"

import {
  LayoutDashboard, Boxes, CalendarClock, Wrench,
  History, Building2,
  LogOut,
  Users,
  Package,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoadingScreen from "./LoadingScreen";

const adminItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Manajemen Aset", url: "/assets", icon: Package },
  { title: "Kelola Jadwal", url: "/maintenance", icon: CalendarClock },
  { title: "Manajemen Pengguna", url: "/pengguna", icon: Users },
  { title: "Riwayat Servis", url: "/reports", icon: History },
];

const teknisiItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Jadwal Perawatan", url: "/tasks", icon: CalendarClock }
];

const AppSidebar = () => {
  const { state } = useSidebar();
  const { role, loading, signOut } = useAuth();
  const collapsed = state === "collapsed";
  const pathname = usePathname();
  const items = role === "admin" ? adminItems : teknisiItems;
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  if (loading) return <LoadingScreen fixed={true} />

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border h-16 flex items-start justify-center">
        <Link href={"/dashboard"} className="flex items-center gap-2 px-2">
          <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center shadow-md">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-base text-sidebar-foreground tracking-tight">ASSETRA</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Assets Era</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-3">
        <SidebarGroup className="h-full">
          {!collapsed && <SidebarGroupLabel className="text-xs">Menu Utama</SidebarGroupLabel>}
          <SidebarGroupContent className="h-full">
            <SidebarMenu className="space-y-1 h-full">
              {items.map((item) => {
                const active = pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton

                      isActive={active}
                      tooltip={item.title}
                      className={`
                        ${active
                          ? "bg-primary! text-primary-foreground! font-medium shadow-sm hover:text-primary-foreground! data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}
                          py-5 cursor-pointer
                          
                      `}
                    >
                      <Link href={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              <SidebarMenuItem className="mt-auto">
                <SidebarMenuButton
                  tooltip={"Logout"}
                  onClick={handleSignOut}
                  className={`bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-600 hover:text-white cursor-pointer transition font-medium shadow-sm py-5! px-3`}
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;