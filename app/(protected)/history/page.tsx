"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { History as HistoryIcon, Wrench, DollarSign, User, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { StatusBadge } from "@/components/Badges";
import { createClient } from "@/supabase/client";

const History = () => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const supabaseRef = useRef(createClient());

    useEffect(() => {
        (async () => {
            setLoading(true);
            const supabase = supabaseRef.current;
            const { data } = await supabase
                .from("technician_reports")
                .select("*, assets(name, code), users(nama_lengkap)")
                .order("created_at", { ascending: false });
            setItems(data ?? []);
            setLoading(false);
        })()
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Riwayat Perawatan</h1>
                <p className="text-muted-foreground mt-1">Semua riwayat maintenance dari awal hingga sekarang.</p>
            </div>

            {loading ?
                <div className="flex flex-col items-center justify-center gap-1 h-32">
                    <p className="text-lg  text-muted-foreground mt-1">Memuat data</p>
                    <Loader2 className="animate-spin text-primary" />
                </div>
                :
                items.length === 0 ? (
                    <Card className="p-12 text-center card-elevated border-0">
                        <HistoryIcon className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                        <p className="text-muted-foreground">Belum ada riwayat.</p>
                    </Card>
                ) : (
                    <div className="relative">
                        <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
                        <div className="space-y-4">
                            {items.map((r) => (
                                <div key={r.id} className="relative pl-14">
                                    <div className="absolute left-0 top-2 h-10 w-10 rounded-full bg-card border-2 border-primary flex items-center justify-center shadow-md">
                                        <Wrench className="h-4 w-4 text-primary" />
                                    </div>
                                    <Card className="p-4 card-elevated border-0">
                                        <div className="flex items-start justify-between gap-3 flex-wrap">
                                            <div>
                                                <h3 className="font-semibold">{r.assets?.name}</h3>
                                                <p className="text-xs text-muted-foreground font-mono">{r.assets?.code}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <StatusBadge value={r.status} />
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(r.created_at), "d MMM yyyy, HH:mm", { locale: idLocale })}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm mt-3">{r.description}</p>
                                        {r.action_taken && (
                                            <p className="text-xs text-muted-foreground mt-1"><span className="font-medium">Tindakan:</span> {r.action_taken}</p>
                                        )}
                                        <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1"><User className="h-3 w-3" />{r.profiles?.full_name ?? "—"}</span>
                                            <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />Rp {Number(r.cost ?? 0).toLocaleString("id-ID")}</span>
                                        </div>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }
        </div>
    );
}

export default History;