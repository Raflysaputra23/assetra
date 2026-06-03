/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Key, Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { useEffect, useRef, useState } from "react"
import ButtonForm from "./ButtonForm"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { createClient } from "@/supabase/client"
import { toast } from "sonner"

const FormForgot = () => {
    const { signOut } = useAuth();
    const router = useRouter();
    const supabaseRef = useRef(createClient());

    const [step, setStep] = useState<1 | 2>(1);
    
    // Step 1 states
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [sendingCode, setSendingCode] = useState(false);
    const [verifying, setVerifying] = useState(false);

    // Step 2 states
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [updatingPassword, setUpdatingPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Alert Banner state
    const [alert, setAlert] = useState(false);
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState(false); // true = success, false = error

    const handleSendCode = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!email) {
            setMessage("Silahkan masukkan email anda terlebih dahulu.");
            setStatus(false);
            setAlert(true);
            return;
        }

        const supabase = supabaseRef.current;
        setSendingCode(true);
        setAlert(false);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) {
                setMessage(error.message || "Gagal mengirim kode verifikasi.");
                setStatus(false);
                setAlert(true);
                toast.error(error.message || "Gagal mengirim kode verifikasi.");
            } else {
                setMessage("Kode verifikasi telah dikirim ke email Anda.");
                setStatus(true);
                setAlert(true);
                toast.success("Kode verifikasi berhasil dikirim!");
            }
        } catch (err: any) {
            setMessage(err.message || "Terjadi kesalahan.");
            setStatus(false);
            setAlert(true);
        } finally {
            setSendingCode(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !code) {
            setMessage("Email dan kode verifikasi wajib diisi.");
            setStatus(false);
            setAlert(true);
            return;
        }

        const supabase = supabaseRef.current;
        setVerifying(true);
        setAlert(false);

        try {
            const { error } = await supabase.auth.verifyOtp({
                email,
                token: code,
                type: 'recovery',
            });

            if (error) {
                setMessage("Kode verifikasi tidak valid atau telah kadaluwarsa.");
                setStatus(false);
                setAlert(true);
                toast.error("Kode verifikasi tidak valid!");
            } else {
                setStep(2);
                setAlert(false);
                toast.success("Verifikasi berhasil! Silahkan masukkan password baru.");
            }
        } catch (err: any) {
            setMessage(err.message || "Terjadi kesalahan saat memverifikasi.");
            setStatus(false);
            setAlert(true);
        } finally {
            setVerifying(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) {
            setMessage("Semua kolom password wajib diisi.");
            setStatus(false);
            setAlert(true);
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage("Konfirmasi password baru tidak cocok.");
            setStatus(false);
            setAlert(true);
            return;
        }

        if (newPassword.length < 6) {
            setMessage("Password baru minimal 6 karakter.");
            setStatus(false);
            setAlert(true);
            return;
        }

        const supabase = supabaseRef.current;
        setUpdatingPassword(true);
        setAlert(false);

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) {
                setMessage(error.message || "Gagal memperbarui password.");
                setStatus(false);
                setAlert(true);
                toast.error(error.message || "Gagal memperbarui password.");
            } else {
                toast.success("Password berhasil diperbarui! Silahkan login kembali.");
                await signOut();
                router.push("/auth");
            }
        } catch (err: any) {
            setMessage(err.message || "Terjadi kesalahan.");
            setStatus(false);
            setAlert(true);
        } finally {
            setUpdatingPassword(false);
        }
    };

    if (step === 1) {
        return (
            <section>
                <h2 className="text-2xl font-bold text-center lg:text-start">Lupa Password</h2>
                <p className="text-sm text-muted-foreground mb-6 text-center lg:text-start">Silahkan masukkan email anda untuk reset password</p>

                {alert && (
                    <div className={`${status ? 'bg-green-500/15 border-green-500 text-green-500' : 'bg-red-500/15 border-red-500 text-red-500'} p-3 rounded-md border border-l-4 mb-4`}>
                        <p className="text-center text-sm font-semibold">{message}</p>
                    </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="si-email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="si-email"
                                name="email"
                                type="email"
                                placeholder="nama@kampus.ac.id"
                                className="pl-9 pr-24"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={handleSendCode}
                                disabled={sendingCode}
                                className="text-primary cursor-pointer text-xs absolute right-3 top-1/2 -translate-y-1/2 font-semibold hover:underline disabled:opacity-50"
                            >
                                {sendingCode ? "Mengirim..." : "Kirim Kode"}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="si-code">Kode Verifikasi</Label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="si-code"
                                name="code"
                                type="text"
                                placeholder="Masukkan Kode Verifikasi"
                                className="pl-9"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <ButtonForm disabled={verifying}>
                        {verifying ? <span className="flex items-center gap-2">Memverifikasi... <Loader2 className="h-4 w-4 animate-spin" /></span> : "Submit"}
                    </ButtonForm>
                </form>
            </section>
        );
    }

    return (
        <section>
            <h2 className="text-2xl font-bold text-center lg:text-start mb-2">Lupa Password</h2>
            <p className="text-sm text-muted-foreground mb-6 text-center lg:text-start">Silahkan masukkan password baru untuk akun Anda</p>

            {alert && (
                <div className={`${status ? 'bg-green-500/15 border-green-500 text-green-500' : 'bg-red-500/15 border-red-500 text-red-500'} p-3 rounded-md border border-l-4 mb-4`}>
                    <p className="text-center text-sm font-semibold">{message}</p>
                </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="new-pwd">Password Baru</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="new-pwd"
                            name="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            placeholder="bangraff123"
                            className="pl-9 pr-10"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirm-pwd">Konfirmasi Password Baru</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="confirm-pwd"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="bangraff123"
                            className="pl-9 pr-10"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
                <ButtonForm disabled={updatingPassword}>
                    {updatingPassword ? <span className="flex items-center gap-2">Memproses... <Loader2 className="h-4 w-4 animate-spin" /></span> : "Submit"}
                </ButtonForm>
            </form>
        </section>
    );
};

export default FormForgot;
