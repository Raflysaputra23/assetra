/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/supabase/client";
import { KeyRound, Loader2, Pencil, Plus, Trash2, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type AppRole = "admin" | "teknisi";
interface UserRow {
    id: string;
    email: string | null;
    nama_lengkap: string | null;
    role: AppRole;
    status: "aktif" | "suspend";
}

const Pengguna = () => {
    const { user, signup } = useAuth();
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const supabaseRef = useRef(createClient());

    const [createOpen, setCreateOpen] = useState(false);
    const [cEmail, setCEmail] = useState("");
    const [cPassword, setCPassword] = useState("");
    const [cName, setCName] = useState("");
    const [cRole, setCRole] = useState<AppRole>("teknisi");

    const [editOpen, setEditOpen] = useState(false);
    const [eUser, setEUser] = useState<UserRow | null>(null);
    const [eName, setEName] = useState("");
    const [eRole, setERole] = useState<AppRole>("teknisi");
    const [ePassword, setEPassword] = useState("");

    const [delUser, setDelUser] = useState<UserRow | null>(null);
    const [suspendUser, setSuspendUser] = useState<{id: string, status: string, email: string} | null>(null);

    const loadUsers = async () => {
        setLoading(true);
        const supabase = supabaseRef.current;
        const { data } = await supabase.from("users").select("*").order("created_at");
        setUsers(data ?? []);
        setLoading(false);
    };


    useEffect(() => {
        (async () => {
            loadUsers();
        })()
    }, []);

    const handleCreate = async () => {
        if (!cEmail || !cPassword || !cName || !cRole) {
            return toast.error("Email, password, dan nama wajib diisi");
        }

        setLoading(true);

        try {
            const response = await fetch("/api/pengguna", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: cEmail,
                    password: cPassword,
                    nama_lengkap: cName,
                    role: cRole,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                toast.error(data.error || "Akun gagal dibuat");
                setLoading(false);
                return;
            }

            toast.success("Akun berhasil dibuat");
            setCreateOpen(false);

            setCEmail("");
            setCPassword("");
            setCName("");
            setCRole("teknisi");

            loadUsers();
        } catch (err: any) {
            toast.error("Terjadi kesalahan sistem saat membuat akun.");
            setLoading(false);
        }
    };

    const openEdit = (u: UserRow) => {
        setEUser(u);
        setEName(u.nama_lengkap ?? "");
        setERole(u.role == 'admin' ? "admin" : "teknisi");
        setEPassword("");
        setEditOpen(true);
    };

    const handleEdit = async () => {
        if (!eUser) return;
        if (!eName || !eRole) {
            return toast.error("Nama dan role wajib diisi");
        }

        setLoading(true);

        try {
            const response = await fetch("/api/pengguna", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: eUser.id,
                    nama_lengkap: eName,
                    role: eRole,
                    password: ePassword || undefined,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                toast.error(data.error || "Akun gagal diperbarui");
                setLoading(false);
                return;
            }

            toast.success("Akun berhasil diperbarui");
            setEditOpen(false);
            loadUsers();
        } catch (err: any) {
            toast.error("Terjadi kesalahan sistem saat memperbarui akun.");
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!delUser) return;
        setLoading(true);

        try {
            const response = await fetch("/api/pengguna", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: delUser.id,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                toast.error(data.error || "Akun gagal dihapus");
                setLoading(false);
                return;
            }

            toast.success("Akun berhasil dihapus");
            setDelUser(null);
            loadUsers();
        } catch (err: any) {
            toast.error("Terjadi kesalahan sistem saat menghapus akun.");
            setLoading(false);
        }
    };

    const toggleStatus = async (id: string, status: string) => {
        const supabase = supabaseRef.current;
        const { error } = await supabase.from("users").update({ status }).eq("id", id);
        if (error) {
            toast.error(`Pengguna gagal di ${status === "suspend" ? "nonaktifkan" : "aktifkan"}`);
            return;
        }
        toast.success(`Pengguna berhasil di ${status === "suspend" ? "nonaktifkan" : "aktifkan"}`);
        loadUsers();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h1>
                    <p className="text-muted-foreground mt-1">Kelola seluruh data akun pengguna dalam sistem.</p>
                </div>
            </div>
            <Card className="p-6 card-elevated border-0">
                <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <User className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="font-semibold">Manajemen Pengguna</h2>
                            <p className="text-xs text-muted-foreground">Buat, ubah, dan hapus akun pengguna.</p>
                        </div>
                    </div>
                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <DialogTrigger className="flex items-center px-4 gap-2 cursor-pointer bg-primary text-white rounded-lg py-2">
                            <Plus className="h-4 w-4" /> Tambah Akun
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className={"font-poppins text-xl font-semibold"}>Buat Akun Baru</DialogTitle>
                                <DialogDescription>Akun langsung aktif tanpa perlu verifikasi email.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 p-3">
                                <div className="space-y-2">
                                    <Label className="after:content-['*'] after:-ml-1 after:text-destructive">Nama Lengkap</Label>
                                    <Input value={cName} onChange={(e) => setCName(e.target.value)} placeholder="Budi Santoso" required />
                                </div>
                                <div className="space-y-2">
                                    <Label className="after:content-['*'] after:-ml-1 after:text-destructive">Email</Label>
                                    <Input type="email" value={cEmail} onChange={(e) => setCEmail(e.target.value)} placeholder="user@kampus.ac.id" required />
                                </div>
                                <div className="space-y-2">
                                    <Label className="after:content-['*'] after:-ml-1 after:text-destructive">Password</Label>
                                    <Input type="text" value={cPassword} onChange={(e) => setCPassword(e.target.value)} placeholder="••••••" required />
                                </div>
                                <div className="space-y-2">
                                    <Label className="after:content-['*'] after:-ml-1 after:text-destructive">Role</Label>
                                    <Select value={cRole} onValueChange={(v) => setCRole(v as AppRole)} required>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="teknisi">Teknisi</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" className="cursor-pointer" onClick={() => setCreateOpen(false)}>Batal</Button>
                                <Button onClick={handleCreate} disabled={loading} className="cursor-pointer">
                                    {loading ? "Menyimpan..." : "Buat Akun"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {loading ?
                    <div className="flex flex-col items-center justify-center gap-1 h-32">
                        <p className="text-lg  text-muted-foreground mt-1">Memuat data</p>
                        <Loader2 className="animate-spin text-primary" />
                    </div>
                    :
                    <div className="overflow-x-auto rounded-lg border border-border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-secondary/50">
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-center">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((u) => {
                                    const current = u.role == 'admin' ? "admin" : "teknisi";
                                    const isSelf = u.id === user?.id;
                                    return (
                                        <TableRow key={u.id}>
                                            <TableCell className="font-medium">{u.nama_lengkap ?? "—"}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={current === "admin" ? "bg-primary/10 text-primary border-primary/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"}>
                                                    {current}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="flex items-center space-x-2">
                                                <Switch id="activate" checked={u.status === "aktif"} disabled={isSelf} onCheckedChange={() => setSuspendUser({ id: u.id, email: u.email ?? "", status: u.status })} />
                                                <Label htmlFor="activate" className="text-muted-foreground">{u.status === "aktif" ? "Aktif" : "Suspend"}</Label>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex justify-center gap-2">
                                                    <Button size="icon" variant="ghost" className={'bg-yellow-500/10 text-yellow-500 cursor-pointer hover:bg-yellow-500/20 hover:text-yellow-500!'} onClick={() => openEdit(u)}>
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" onClick={() => setDelUser(u)} disabled={isSelf}
                                                        className="bg-destructive/10 text-destructive cursor-pointer hover:bg-destructive/20 hover:text-destructive!">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {users.length === 0 && (
                                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Belum ada pengguna</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                }
            </Card>

            {/* Edit dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className={"font-poppins text-xl font-semibold"}>Edit Akun</DialogTitle>
                        <DialogDescription>{eUser?.email}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 p-3">
                        <div className="space-y-2">
                            <Label>Nama Lengkap</Label>
                            <Input value={eName} onChange={(e) => setEName(e.target.value)} placeholder="Nama Lengkap" />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={eRole} onValueChange={(v) => setERole(v as AppRole)} disabled={eUser?.id === user?.id}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="teknisi">Teknisi</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><KeyRound className="h-3.5 w-3.5" /> Password </Label>
                            <Input type="text" value={ePassword} onChange={(e) => setEPassword(e.target.value)} placeholder="Kosongkan jika tidak diubah" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className={"cursor-pointer"} onClick={() => setEditOpen(false)}>Batal</Button>
                        <Button onClick={handleEdit} disabled={loading} className="cursor-pointer">
                            {loading ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirm */}
            <AlertDialog open={!!delUser} onOpenChange={(o) => !o && setDelUser(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus akun ini?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Akun <span className="font-semibold">{delUser?.email}</span> akan dihapus permanen beserta seluruh datanya. Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!suspendUser} onOpenChange={(o) => !o && setSuspendUser(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className={'font-bold text-center w-full mb-3'}>{suspendUser?.status === "aktif" ? "Nonaktifkan Akun" : "Aktifkan Akun"}?</AlertDialogTitle>
                        <AlertDialogDescription className={'text-center'}>
                            Apakah Anda yakin ingin {suspendUser?.status === "aktif" ? "menonaktifkan" : "mengaktifkan"} akun {suspendUser?.email}? Pengguna dapat login kembali setelah akun diaktifkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { toggleStatus(suspendUser?.id || '', suspendUser?.status === "aktif" ? "suspend" : "aktif"); setSuspendUser(null) }} className="bg-destructive text-white hover:bg-destructive/90">
                            {suspendUser?.status === "aktif" ? "Nonaktifkan" : "Aktifkan"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export default Pengguna;
