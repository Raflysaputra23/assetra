/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Download, Eye, FileBarChart2, Info, Loader2, MapPin, Wrench } from "lucide-react";
import { StatusBadge } from "@/components/Badges";
import { exportToCSV, exportToPDF } from "@/lib/exporters";
import { format } from "date-fns";
import { createClient } from "@/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";

export default function Reports() {
    const [reports, setReports] = useState<any[]>([]);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [location, setLocation] = useState("");
    const [loading, setLoading] = useState<boolean>(true);
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const supabaseRef = useRef(createClient());

    const load = async () => {
        setLoading(true);
        const supabase = supabaseRef.current;
        let q = supabase
            .from("technician_reports")
            .select("*, assets(name, code, building, floor, room), users(nama_lengkap)")
            .order("created_at", { ascending: false });
        if (from) q = q.gte("created_at", from);
        if (to) q = q.lte("created_at", `${to}T23:59:59`);
        const { data } = await q;
        let items = data ?? [];
        if (location) {
            const l = location.toLowerCase();
            items = items.filter((r: any) =>
                [r.assets?.building, r.assets?.floor, r.assets?.room].filter(Boolean).join(" ").toLowerCase().includes(l)
            );
        }
        setReports(items);
        setLoading(false);
    };

    useEffect(() => {
        (async () => {
            await load();
        })()
    }, []);

    const totalCost = reports.reduce((s, r) => s + Number(r.cost ?? 0), 0);

    const rowsForExport = reports.map((r) => ({
        Tanggal: format(new Date(r.created_at), "yyyy-MM-dd HH:mm"),
        Aset: `${r.assets?.code} - ${r.assets?.name}`,
        Lokasi: [r.assets?.building, r.assets?.floor, r.assets?.room].filter(Boolean).join(" / "),
        Teknisi: r.users?.nama_lengkap ?? "-",
        Deskripsi: r.description,
        Tindakan: r.action_taken ?? "-",
        Biaya: `Rp ${Number(r.cost ?? 0).toLocaleString("id-ID")}`,
        Status: r.status,
    }));

    const openDetail = (r: any) => {
        setSelectedReport(r);
        setOpenDetailModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Riwayat Servis</h1>
                    <p className="text-muted-foreground mt-1">Lihat semua riwayat servis yang telah dilakukan.</p>
                </div>
                <div className="flex gap-2">
                    <Button className="cursor-pointer px-4" onClick={() => exportToCSV("assetra-laporan", rowsForExport)}>
                        <Download className="h-4 w-4" />Excel
                    </Button>
                </div>
            </div>

            <Card className="p-4 card-elevated border-0">
                <div className="grid gap-3 md:grid-cols-4 mb-4">
                    <div className="space-y-1">
                        <Label className="text-xs">Dari Tanggal</Label>
                        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Sampai Tanggal</Label>
                        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                    </div>
                    <div className="space-y-1 relative">
                        <Label className="text-xs">Lokasi</Label>
                        <Input placeholder="Gedung / lantai / ruang" className="pr-8" value={location} onChange={(e) => setLocation(e.target.value)} />
                        <MapPin className="h-4 w-4 text-muted-foreground absolute bottom-4 right-2.5" />
                    </div>
                    <div className="flex items-end">
                        <Button onClick={load} className="w-full cursor-pointer">Terapkan Filter</Button>
                    </div>
                </div>

                {loading ?
                    <div className="flex flex-col items-center justify-center gap-1 h-32">
                        <p className="text-lg  text-muted-foreground mt-1">Memuat data</p>
                        <Loader2 className="animate-spin text-primary" />
                    </div>
                    :
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                            <div className="p-3 rounded-lg bg-primary/10">
                                <p className="text-xs text-muted-foreground">Total Laporan</p>
                                <p className="text-2xl font-bold text-primary">{reports.length}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-green-500/10">
                                <p className="text-xs text-muted-foreground">Selesai</p>
                                <p className="text-2xl font-bold text-green-500">{reports.filter((r) => r.status === "completed").length}</p>
                            </div>
                            <div className="col-span-2 lg:col-span-1 p-3 rounded-lg bg-yellow-500/10">
                                <p className="text-xs text-muted-foreground">Total Biaya</p>
                                <p className="text-2xl font-bold text-yellow-500">Rp. {totalCost.toLocaleString("id-ID")}</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-primary hover:bg-primary/90">
                                        <TableHead className="text-white">Tanggal</TableHead>
                                        <TableHead className="text-white">Aset</TableHead>
                                        <TableHead className="text-white">Teknisi</TableHead>
                                        <TableHead className="text-white">Deskripsi Kerusakan</TableHead>
                                        <TableHead className="text-white">Tindakan</TableHead>
                                        <TableHead className="text-white">Biaya</TableHead>
                                        <TableHead className="text-white">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reports.length === 0 ? (
                                        <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                            <FileBarChart2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                            Tidak ada laporan.
                                        </TableCell></TableRow>
                                    ) : reports.map((r) => (
                                        <TableRow key={r.id}>
                                            <TableCell className="text-xs whitespace-nowrap">{format(new Date(r.created_at), "dd MMM yyyy")}</TableCell>
                                            <TableCell>
                                                <div className="font-medium text-sm">{r.assets?.name}</div>
                                                <div className="text-xs text-muted-foreground font-mono">{r.assets?.code}</div>
                                            </TableCell>
                                            <TableCell className="text-sm">{r.users?.nama_lengkap ?? "—"}</TableCell>
                                            <TableCell className="text-sm max-w-xs truncate">{r.description}</TableCell>
                                            <TableCell className="text-sm max-w-xs truncate">{r.action_taken}</TableCell>
                                            <TableCell className="text-sm whitespace-nowrap">Rp. {Number(r.cost ?? 0).toLocaleString("id-ID")}</TableCell>
                                            <TableCell>
                                                <Button onClick={() => openDetail(r)} size="icon" variant="ghost" className="hover:bg-primary/20! bg-primary/10 cursor-pointer" ><Eye className="h-4 w-4 text-primary" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </>
                }
            </Card>

            {/* MODAL DETAIL JADWAL */}
            {selectedReport && (
            <Dialog open={openDetailModal} onOpenChange={setOpenDetailModal}>
                <DialogContent className={'p-6'}>
                    <DialogHeader>
                        <DialogTitle className={"font-poppins text-lg font-semibold"}>Detail Jadwal</DialogTitle>
                    </DialogHeader>
                    <section className="space-y-6">
                        <section className="grid grid-cols-2 gap-4">
                            <Card className="bg-primary/10 flex flex-row items-center gap-4 px-4! p-2">
                                <div className="p-3 rounded-xl bg-white shadow">
                                    <Image className="size-10 object-cover" src="/assets/komputer.svg" alt="icon computer" width={50} height={50} />
                                </div>
                                <section>
                                    <p className="text-muted-foreground text-sm font-semibold">Nama Aset</p>
                                    <h2 className="font-bold text-lg">{selectedReport?.assets?.name}</h2>
                                    <p className="text-primary text-xs font-semibold">{selectedReport?.assets?.code}</p>
                                </section>
                            </Card>
                            <Card className="bg-primary/10 flex flex-row items-center gap-4 px-4! p-2">
                                <section className="flex-1">
                                    <p className="text-sm text-muted-foreground font-semibold">Tanggal Laporan</p>
                                    <p className="font-bold">{format(new Date(selectedReport?.created_at || ''), 'dd MMM yyyy')}</p>
                                </section>
                                <section className="flex-1">
                                    <p className="text-sm text-muted-foreground font-semibold">Nama Teknisi</p>
                                    <p className="font-bold">{selectedReport?.users?.nama_lengkap ?? "-"}</p>
                                </section>
                            </Card>
                        </section>
                        <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground flex items-center gap-2"><Info className="size-4 text-yellow-500" /> Deskripsi Kerusakan</Label>
                            <Input readOnly value={selectedReport?.description || "Tidak ada catatan"} className="bg-yellow-500/10 italic" required />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground flex items-center gap-2"><Wrench className="size-4" /> Tindakan</Label>
                            <Input readOnly value={selectedReport?.action_taken || "Tidak ada catatan"} className="bg-primary/10 italic" required />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground flex items-center gap-1">Total Biaya Servis</Label>
                            <div className="flex items-center gap-2">
                                <p className="font-semibold p-2 bg-muted rounded-md">Rp.</p>
                                <p className="font-bold text-lg">{Number(selectedReport?.cost || 0).toLocaleString("id-ID")}</p>
                            </div>
                        </div>
                    </section>
                </DialogContent>
            </Dialog>
            )}
        </div>
    );
}
