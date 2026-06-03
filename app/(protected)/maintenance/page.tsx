/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, CalendarClock, Repeat, Loader2, Pencil, Eye, Trash, Calendar, Wrench, Notebook } from "lucide-react";
import { StatusBadge, PriorityBadge, ConditionBadge } from "@/components/Badges";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { format, addMonths } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { createClient } from "@/supabase/client";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Jadwal {
    asset_id: string | null;
    scheduled_date: any;
    type: string | null;
    assets?: any | null;
    interval_months: any;
    priority: string | null;
    notes: any;
    status: string;
}

const empty = {
    asset_id: "", scheduled_date: "", type: "manual", interval_months: 3,
    priority: "sedang", notes: "", status: "upcoming",
}

const Maintenance = () => {
    const { role } = useAuth();
    const isAdmin = role === "admin";
    const [items, setItems] = useState<any[]>([]);
    const [assets, setAssets] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [editing, setEditing] = useState<any | null>(null);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState<boolean>(true);
    const [form, setForm] = useState<Jadwal>(empty);
    const [delId, setDelId] = useState<string | null>(null);
    const supabaseRef = useRef(createClient());

    const load = async () => {
        setLoading(true);
        const supabase = supabaseRef.current;
        const { data } = await supabase
            .from("maintenance_schedules")
            .select("*, assets(name, code)")
            .order("scheduled_date", { ascending: true });
        const { data: aset } = await supabase.from("assets").select("id, name, code");
        setItems(data ?? []);
        setAssets(aset ?? []);
        setLoading(false);
    };

    useEffect(() => {
        (async () => {
            await load();
        })()
    }, []);

    const filtered = items.filter((i) => filter === "all" || i.status === filter);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.asset_id || !form.scheduled_date || !form.priority || !form.type) {
            return toast.error("Aset, Tanggal, Prioritas & Tipe wajib diisi!");
        }

        const supabase = supabaseRef.current;
        const payload = {
            ...form,
            interval_months: form.type === "auto" ? Number(form.interval_months) : null,
        };

        if (editing) {
            const { error } = await supabase.from("maintenance_schedules").update(payload).eq("id", editing.id);
            if (error) return toast.error("Jadwal gagal diubah");
            toast.success("Jadwal berhasil diubah");
            if (form.type === "auto") {
                const next: any[] = [];
                let d = new Date(form.scheduled_date);
                for (let i = 1; i <= 3; i++) {
                    d = addMonths(d, Number(form.interval_months));
                    next.push({ ...payload, scheduled_date: format(d, "yyyy-MM-dd") });
                }
                await supabase.from("maintenance_schedules").insert(next);
            }
        } else {
            const { error } = await supabase.from("maintenance_schedules").insert(payload);
            if (error) return toast.error("Jadwal gagal ditambahkan!");
            toast.success("Jadwal berhasil ditambahkan!");
            if (form.type === "auto") {
                const next: any[] = [];
                let d = new Date(form.scheduled_date);
                for (let i = 1; i <= 3; i++) {
                    d = addMonths(d, Number(form.interval_months));
                    next.push({ ...payload, scheduled_date: format(d, "yyyy-MM-dd") });
                }
                await supabase.from("maintenance_schedules").insert(next);
            }
        }

        setOpen(false);
        load();
    };

    const updateStatus = async (id: string, status: string) => {
        const supabase = supabaseRef.current;
        const { error } = await supabase.from("maintenance_schedules").update({ status: status as any }).eq("id", id);
        if (error) toast.error(error.message);
        else { toast.success("Status diperbarui"); load(); }
    };

    const openNew = () => {
        setEditing(null);
        setForm({ ...empty });
        setOpen(true);
    };

    const openEdit = (a: any) => {
        setEditing(a);
        setForm({ asset_id: a.asset_id, scheduled_date: a.scheduled_date, type: a.type, interval_months: a.interval_months, priority: a.priority, notes: a.notes, status: a.status });
        setOpen(true);
    };

    const openDetail = (a: any) => {
        setForm({ ...a });
        setOpenDetailModal(true);
    }

    const confirmDelete = async () => {
        if (!delId) return;
        const supabase = supabaseRef.current;
        const { error } = await supabase.from("maintenance_schedules").delete().eq("id", delId);
        if (error) toast.error("Jadwal gagal dihapus");
        else toast.success("Jadwal berhasil dihapus");
        setDelId(null);
        load();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Kelola Jadwal</h1>
                    <p className="text-muted-foreground mt-1">Atur perawatan manual atau otomatis berkala.</p>
                </div>
                {isAdmin && (
                    <Button onClick={openNew} className="cursor-pointer">
                        <Plus className="h-4 w-4" />Buat Jadwal
                    </Button>
                )}
            </div>

            <Card className="p-4 card-elevated border-0">
                <div className="flex gap-2 mb-4 flex-wrap">
                    {[
                        { v: "all", l: "Semua" },
                        { v: "upcoming", l: "Terjadwal" },
                        { v: "completed", l: "Selesai" }
                    ].map((f) => (
                        <Button key={f.v} variant={filter === f.v ? "default" : "outline"} size="sm"
                            onClick={() => setFilter(f.v)}
                            className={"cursor-pointer"}>
                            {f.l}
                        </Button>
                    ))}
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
                                <TableRow className="bg-primary hover:bg-primary/90">
                                    <TableHead className="text-white">Aset</TableHead>
                                    <TableHead className="text-white">Tanggal</TableHead>
                                    <TableHead className="text-white">Tipe</TableHead>
                                    <TableHead className="text-white">Prioritas</TableHead>
                                    <TableHead className="text-white">Status</TableHead>
                                    <TableHead className="text-center text-white">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Belum ada jadwal.</TableCell></TableRow>
                                ) : filtered.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell>
                                            <div className="font-medium">{s.assets?.name}</div>
                                            <div className="text-xs text-muted-foreground font-mono">{s.assets?.code}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm">
                                                <CalendarClock className="h-4 w-4 text-primary" />
                                                {format(new Date(s.scheduled_date), "d MMM yyyy", { locale: idLocale })}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {s.type === "auto" ? (
                                                <span className="inline-flex items-center gap-1 text-xs"><Repeat className="h-3 w-3" />Auto · {s.interval_months}bln</span>
                                            ) : <span className="text-xs">Manual</span>}
                                        </TableCell>
                                        <TableCell><PriorityBadge value={s.priority} /></TableCell>
                                        <TableCell><StatusBadge value={s.status} /></TableCell>
                                        <TableCell className="text-center space-x-1">
                                            <Button onClick={() => openDetail(s)} variant={'ghost'} size={'icon'} className="bg-primary/10 text-primary hover:text-primary! hover:bg-cyan-500/30 cursor-pointer">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button onClick={() => openEdit(s)} variant={'ghost'} size={'icon'} className="bg-yellow-500/10 text-yellow-500 hover:text-yellow-500! hover:bg-yellow-500/30 cursor-pointer">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button onClick={() => setDelId(s.id!)} variant={'ghost'} size={'icon'} className="bg-destructive/10 text-destructive hover:text-destructive! hover:bg-destructive/30 cursor-pointer">
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                }
            </Card>

            {/* MODAL EDIT & TAMBAH JADWAL */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader><DialogTitle className="font-poppins text-xl font-semibold">Buat Jadwal</DialogTitle></DialogHeader>
                    <form onSubmit={submit}>
                        <section className="space-y-4 p-3">
                            <div className="space-y-2">
                                <Label className="after:content-['*'] after:-ml-1 after:text-destructive">Aset</Label>
                                <Select value={form.asset_id} onValueChange={(v) => setForm({ ...form, asset_id: v })} required>
                                    <SelectTrigger><SelectValue placeholder="Pilih aset..." /></SelectTrigger>
                                    <SelectContent>
                                        {assets.map((a) => <SelectItem key={a.id} value={a.id}>{a.code} — {a.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="after:content-['*'] after:-ml-1 after:text-destructive">Tanggal</Label>
                                    <Input type="date" value={form.scheduled_date}
                                        onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label className="after:content-['*'] after:-ml-1 after:text-destructive">Tipe</Label>
                                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })} required>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="manual">Manual</SelectItem>
                                            <SelectItem value="auto">Otomatis (berulang)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {form.type === "auto" && (
                                    <div className="space-y-2">
                                        <Label className="after:content-['*'] after:-ml-1 after:text-destructive">Interval (bulan)</Label>
                                        <Input type="number" min={1} value={form.interval_months || 3}
                                            onChange={(e) => setForm({ ...form, interval_months: e.target.value })} />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label className="after:content-['*'] after:-ml-1 after:text-destructive">Prioritas</Label>
                                    <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })} required>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="rendah">Rendah</SelectItem>
                                            <SelectItem value="sedang">Sedang</SelectItem>
                                            <SelectItem value="tinggi">Tinggi</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label>Catatan (opsional)</Label>
                                    <Textarea rows={3} className="resize-none" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                                </div>
                            </div>
                        </section>
                        <DialogFooter>
                            <Button type="button" variant="outline" className="cursor-pointer" onClick={() => setOpen(false)}>Batal</Button>
                            <Button type="submit" className="cursor-pointer">Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* MODAL DETAIL JADWAL */}
            <Dialog open={openDetailModal} onOpenChange={setOpenDetailModal}>
                <DialogContent className={'p-6'}>
                    <DialogHeader>
                        <DialogTitle className={"font-poppins text-lg font-semibold"}>Detail Jadwal</DialogTitle>
                    </DialogHeader>
                    <section className="space-y-6">
                        <Card className="bg-primary/10 flex flex-row items-center gap-4 px-4! p-2">
                            <div className="p-3 rounded-xl bg-white shadow">
                                <Image className="size-10 object-cover" src="/assets/komputer.svg" alt="icon computer" width={50} height={50} />
                            </div>
                            <section>
                                <p className="text-primary text-xs font-semibold">{form.assets?.code}</p>
                                <h2 className="font-bold text-lg">{form.assets?.name}</h2>
                                <section className="flex items-center gap-2">
                                    {form.type === "manual" ? <Badge variant="outline" className={"bg-primary/10 text-primary border-primary/20 [a]:hover:bg-primary"}>Manual</Badge> : <Badge variant="outline" className={"bg-yellow-500/10 text-yellow border-yellow-500/20 [a]:hover:bg-yellow"}>Otomatis</Badge>}
                                    <StatusBadge value={form.status} />
                                </section>
                            </section>
                        </Card>
                        <Card className="bg-primary/10 space-y-1 px-4! p-2">
                            <h4 className="flex items-center gap-2 text-xs text-muted-foreground"><Calendar className="size-3" /> Tanggal Jadwal</h4>
                            <p className="font-bold">{form.scheduled_date}</p>
                        </Card>
                        <div className="space-y-2">
                            <h4 className="flex items-center gap-2 text-xs text-muted-foreground"><Wrench className="size-3" /> Status Perbaikan</h4>
                            <StatusBadge value={form.status} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground flex items-center gap-1"><Notebook className="size-4" /> Catatan</Label>
                            <Textarea rows={1} readOnly value={form.notes || "Tidak ada catatan"} className="bg-yellow-500/10 resize-none italic" required />
                        </div>
                    </section>
                </DialogContent>
            </Dialog>

            {/* ALERT DELETE */}
            <AlertDialog open={!!delId} onOpenChange={(o) => !o && setDelId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className={"font-poppins text-lg font-semibold"}>Hapus Jadwal</AlertDialogTitle>
                        <AlertDialogDescription>Apakah anda yakin ingin menghapus jadwal ini?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className={"cursor-pointer"}>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive cursor-pointer">Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}


export default Maintenance;