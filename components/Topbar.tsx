"use client"

import { User as UserIcon } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";

export function Topbar() {
    const { user, role } = useAuth();
    const router = useRouter();
    const [alertCount, setAlertCount] = useState(0);
    const supabaseRef = useRef(createClient());

    useEffect(() => {
        const load = async () => {
            const supabase = supabaseRef.current;
            const { count } = await supabase
                .from("maintenance_schedules")
                .select("*", { count: "exact", head: true })
                .in("status", ["upcoming", "missed"]);
            setAlertCount(count ?? 0);
        };
        load();
    }, []);

    const emailLocal = user?.email?.split("@")[0] ?? "U";
    const letters = emailLocal.replace(/[^a-zA-Z]/g, "");
    const initials = (letters.length >= 2 ? letters.slice(0, 2) : (letters || emailLocal).slice(0, 2)).toUpperCase();
    const displayName = letters.length >= 2 ? letters : emailLocal;

    return (
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-30 flex items-center px-4 gap-3">
            <SidebarTrigger className="hover:bg-accent" />

            <form
                className="hidden md:flex items-center gap-2 flex-1 max-w-md ml-2"
                onSubmit={(e) => {
                    e.preventDefault();
                    const q = (e.currentTarget.elements.namedItem("topsearch") as HTMLInputElement)?.value.trim();
                    router.push(q ? `/assets?q=${encodeURIComponent(q)}` : "/assets");
                }}
            >
            </form>

            <div className="flex-1" />

            {/* <Button variant="ghost" size="icon" className="relative" onClick={() => router.push("/maintenance")}>
                <Bell className="h-5 w-5" />
                {alertCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-[10px] gradient-primary border-0">
                        {alertCount}
                    </Badge>
                )}
            </Button> */}

            <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-2 cursor-pointer hover:bg-accent rounded-lg py-2">
                    <Avatar className="h-8 w-8 border border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                            {initials}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col items-start leading-tight">
                        <span className="text-sm font-medium max-w-35 truncate">
                            {displayName}
                        </span>

                        <span className="text-[10px] text-muted-foreground capitalize">
                            {role ?? "user"}
                        </span>
                    </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>
                            <div className="flex flex-col gap-1">
                                <span className="text-[0.7rem] text-muted-foreground">
                                    Login sebagai
                                </span>

                                <span className="text-sm truncate text-foreground">
                                    {user?.email}
                                </span>
                            </div>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem className={'cursor-pointer py-2 flex items-center gap-2'} onClick={() => router.push("/profile")}>
                            <UserIcon className="h-4! w-4!" />
                            <span className="text-sm">Profil</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
