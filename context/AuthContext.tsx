"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/supabase/client";

export type AppRole = "admin" | "teknisi";

interface AuthContextValue {
    user: User | null;
    session: Session | null;
    role: AppRole | null;
    loading: boolean;
    signOut: () => Promise<void>;
    signin: (email: string, password: string) => Promise<boolean | "suspend">;
    signup: (nama_lengkap: string, email: string, password: string, role: AppRole) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [role, setRole] = useState<AppRole | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const supabaseRef = useRef(createClient());

    const fetchRole = async (userId: string | null) => {
        if(userId) {
            const supabase = supabaseRef.current;
            const { error, data } = await supabase
                .from("users")
                .select("role")
                .eq("id", userId)
                .order("role", { ascending: true });
            console.log(error);
            if (!data || data.length == 0) {
                setRole(null);
            } else {
                const roles = data.map((r) => r.role as AppRole);
                setRole(roles.includes("admin") ? "admin" : "teknisi");
            }
        } else {
            setRole(null);
        }
    };

    const getSession = async () => {
        setLoading(true);

        const supabase = supabaseRef.current;
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        fetchRole(session?.user?.id ?? null);

        setLoading(false);
    }

    useEffect(() => {
        const supabase = supabaseRef.current;

        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            setLoading(true);
            if (_event === "SIGNED_OUT") {
                setSession(null);
                setUser(null);
                setRole(null);
            } else {
                setSession(session);
                setUser(session?.user ?? null);
                fetchRole(session?.user?.id ?? null);
            }
            setLoading(false);
        });

        return () => {
            sub.subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        const supabase = supabaseRef.current;
        await supabase.auth.signOut();
    };

    const signin = async (email: string, password: string) => {
        const supabase = supabaseRef.current;
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) return false;

        const { data: dbUser } = await supabase
            .from("users")
            .select("status")
            .eq("id", data.user.id)
            .single();

        if (dbUser?.status === "suspend") {
            await supabase.auth.signOut();
            return "suspend";
        }

        return true;
    }

    const signup = async (nama_lengkap: string, email: string, password: string, role: AppRole) => {
        const supabase = supabaseRef.current;
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    nama_lengkap,
                    role
                },
                emailRedirectTo: `${process.env.NEXT_PUBLIC_DOMAIN_URL}/auth/verify`
            }
        })
        if (error) return false;
        return true;
    }

    return (
        <AuthContext.Provider value={{ user, session, role, loading, signOut, signin, signup }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
