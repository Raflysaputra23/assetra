/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createClient } from "@/supabase/client";
import Skeleton from "@/components/Skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Profile() {
    const { user, role, loading } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loadingForm, setLoadingForm] = useState(false);
    const supabaseRef = useRef(createClient());

    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const loadUser = async () => {
        if (!user) return;
        const supabase = supabaseRef.current;
        const { data } = await supabase.from("users").select("*").eq("id", user?.id).single();
        setName(data?.nama_lengkap ?? "");
        setEmail(data?.email ?? "");
    };

    useEffect(() => {
        (async () => {
            await loadUser();
        })();
    }, [user]);

    const saveProfile = async () => {
        if (!user) return;

        const supabase = supabaseRef.current;
        setLoadingForm(true);

        try {
            if (role === "teknisi" && showPasswordSection && (oldPassword || newPassword || confirmPassword)) {
                if (!oldPassword || !newPassword || !confirmPassword) {
                    toast.error("Semua kolom password harus diisi.");
                    setLoadingForm(false);
                    return;
                }

                if (newPassword !== confirmPassword) {
                    toast.error("Konfirmasi password baru tidak cocok.");
                    setLoadingForm(false);
                    return;
                }

                if (newPassword.length < 6) {
                    toast.error("Password baru minimal 6 karakter.");
                    setLoadingForm(false);
                    return;
                }

                // Verify old password
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: user.email!,
                    password: oldPassword,
                });

                if (signInError) {
                    toast.error("Password lama salah.");
                    setLoadingForm(false);
                    return;
                }

                const { error: updatePwdError } = await supabase.auth.updateUser({
                    password: newPassword,
                });

                if (updatePwdError) {
                    toast.error("Password gagal diubah");
                    setLoadingForm(false);
                    return;
                }

                // Reset states
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setShowPasswordSection(false);
            }

            // Save name
            const { error: updateProfileError } = await supabase
                .from("users")
                .update({ nama_lengkap: name })
                .eq("id", user.id);

            if (updateProfileError) {
                toast.error("Profil gagal diubah");
            } else {
                toast.success("Profil berhasil diubah");
                await loadUser();
            }
        } catch (err: any) {
            toast.error("Terjadi kesalahan sistem.");
        } finally {
            setLoadingForm(false);
        }
    };

    const initials = name
        ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
        : email.split("@")[0].slice(0, 2).toUpperCase();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profil Saya</h1>
            </div>

            <Card className="p-6 card-elevated border-0 max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                    {loading ? (
                        <Skeleton width="w-12" height="h-12 rounded-full" />
                    ) : (
                        <Avatar className="h-12 w-12 border border-primary/20">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    )}
                    <div>
                        {loading ? (
                            <div className="space-y-2">
                                <Skeleton width="w-32" height="h-4" />
                                <Skeleton width="w-20" height="h-3" />
                            </div>
                        ) : (
                            <>
                                <h2 className="font-bold text-lg leading-tight">{name || email}</h2>
                                <p className="text-xs text-muted-foreground capitalize leading-tight mt-1">
                                    {role ?? "user"}
                                </p>
                            </>
                        )}
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="profile-name">Nama</Label>
                        {loading ? (
                            <Skeleton height="h-8" />
                        ) : (
                            <Input
                                id="profile-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        )}
                    </div>

                    {role === "teknisi" && (
                        <div className="space-y-4">
                            <button
                                type="button"
                                onClick={() => setShowPasswordSection(!showPasswordSection)}
                                className="font-bold underline text-sm cursor-pointer text-left block text-primary hover:text-primary/80 transition-colors mt-2"
                            >
                                Ubah Password (Opsional)
                            </button>

                            {showPasswordSection && (
                                <div className="space-y-4 pt-2 border-t border-border">
                                    <div className="space-y-2">
                                        <Label htmlFor="old-pwd">Password Lama</Label>
                                        <Input
                                            id="old-pwd"
                                            type="password"
                                            placeholder="Masukkan password lama"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-pwd">Password Baru</Label>
                                        <Input
                                            id="new-pwd"
                                            type="password"
                                            placeholder="Masukkan password baru"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-pwd">Konfirmasi Password Baru</Label>
                                        <Input
                                            id="confirm-pwd"
                                            type="password"
                                            placeholder="Masukkan kembali password baru"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        <Button disabled={loadingForm} onClick={saveProfile} className="cursor-pointer">
                            {loadingForm ? (
                                <span className="flex items-center gap-2">
                                    Menyimpan <Loader2 className="animate-spin h-4 w-4" />
                                </span>
                            ) : (
                                "Simpan"
                            )}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
