"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wrench, CalendarClock, MapPin, Loader2, Clock } from "lucide-react";
import { StatusBadge, PriorityBadge } from "@/components/Badges";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { createClient } from "@/supabase/client";

const CardTask = ({ t, openReport }: { t: any; openReport: (t: any) => void }) => {
    const [openDropdown, setOpenDropdown] = useState<boolean>(false);

    return (
        <section key={t.id} className="p-2 space-y-4">
            <div className="flex items-center gap-2">
                <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <CalendarClock className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg leading-tight">{t.assets?.name}</h3>
                    <div className="flex items-center gap-1">
                        <p className="text-xs text-muted-foreground font-mono">{t.assets?.code}</p>
                        <span>•</span>
                        <p className="text-xs text-muted-foreground">{format(new Date(t.scheduled_date), "EEEE, d MMM yyyy", { locale: idLocale })}</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setOpenDropdown(!openDropdown)} className="ml-auto cursor-pointer bg-primary/10 text-primary px-3">Lihat Detail</Button>
            </div>

            {/* MODAL */}
            <div className={`px-2 space-y-2 ${openDropdown ? "visible opacity-100 translate-y-0 h-auto transition" : "invisible opacity-0 translate-y-2 h-0"}`}>
                <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs text-muted-foreground">{format(new Date(t.scheduled_date), "EEEE, d MMM yyyy", { locale: idLocale })}</span>
                </p>
                <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-xs text-muted-foreground">{t.assets?.building} - {t.assets?.room}, Lt. {t.assets?.floor}</span>
                </p>
                <Input type="text" name="notes" className="bg-muted" readOnly value={t.notes} />
                <Button size="sm" className="px-3 py-4 cursor-pointer" onClick={() => openReport(t)} >Buat Laporan</Button>
            </div>
        </section>
    )
}

export default function Tasks() {
    const { user, role } = useAuth();
    const [tasks, setTasks] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState<any | null>(null);
    const [form, setForm] = useState({ description: "", action_taken: "", cost: 0, status: "completed" as any });
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingForm, setLoadingForm] = useState<boolean>(false);
    const supabaseRef = useRef(createClient());

    const load = async () => {
        setLoading(true);
        const supabase = supabaseRef.current;
        const { data } = await supabase
            .from("maintenance_schedules")
            .select("*, assets(name, code, building, floor, room)")
            .in("status", ["upcoming", "ongoing"])
            .order("scheduled_date", { ascending: true });
        setTasks(data ?? []);
        setLoading(false);
    };

    useEffect(() => {
        (async () => {
            await load();
        })()
    }, [role, user]);

    const openReport = (t: any) => {
        setActive(t);
        setForm({ description: "", action_taken: "", cost: 0, status: "completed" });
        setOpen(true);
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!active || !user) return;
        if (!form.description.trim()) return toast.error("Deskripsi wajib diisi");
        
        setLoadingForm(true);
        const supabase = supabaseRef.current;
        const { error } = await supabase.from("technician_reports").insert({
            schedule_id: active.id,
            asset_id: active.asset_id,
            technician_id: user.id,
            description: form.description,
            action_taken: form.action_taken,
            cost: Number(form.cost) || 0,
            status: form.status as any,
        });
        if (error) return toast.error(error.message);
        if (form.status === "completed") {
            await supabase.from("maintenance_schedules").update({ status: "completed" }).eq("id", active.id);
        } else {
            await supabase.from("maintenance_schedules").update({ status: "ongoing" }).eq("id", active.id);
        }

        toast.success("Laporan dikirim");
        setOpen(false);
        load();
        setLoadingForm(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Jadwal Perawatan</h1>
                <p className="text-muted-foreground mt-1">
                    Lihat jadwal perawatan aset yang tersedia.
                </p>
            </div>

            {loading ?
                <div className="flex flex-col items-center justify-center gap-1 h-32">
                    <p className="text-lg  text-muted-foreground mt-1">Memuat data</p>
                    <Loader2 className="animate-spin text-primary" />
                </div>
                :
                tasks.length === 0 ? (
                    <Card className="p-12 text-center card-elevated border-0">
                        <Wrench className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                        <p className="text-muted-foreground">Tidak ada tugas aktif saat ini.</p>
                    </Card>
                ) : (
                    <Card className="p-4 card-elevated border-0 space-y-2">
                        {tasks.map((t) => (
                            <CardTask key={t.id} t={t} openReport={openReport} />
                        ))}
                    </Card>
                )
            }



            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Laporan untuk {active?.assets?.name}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Deskripsi Kerusakan / Pemeriksaan</Label>
                            <Textarea required value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Tindakan</Label>
                            <Textarea value={form.action_taken}
                                onChange={(e) => setForm({ ...form, action_taken: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Biaya (Rp)</Label>
                                <Input type="number" min={0} value={form.cost}
                                    onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="completed">Selesai</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                            <Button disabled={loadingForm} type="submit" className="gradient-primary text-primary-foreground border-0">{loadingForm ? <span className="flex items-center gap-2">Menigirm... <Loader2 className="animate-spin" /></span> : "Kirim"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
