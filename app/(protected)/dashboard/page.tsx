/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { StatusBadge } from "@/components/Badges";
import StatCard from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/supabase/client";
import { id as idLocale } from "date-fns/locale";
import { format } from "date-fns";
import { AlertTriangle, Boxes, CalendarClock, CheckCircle2, Loader2, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const Dashboard = () => {
  const { role, user } = useAuth();
  const [stats, setStats] = useState({ total: 0, aktif: 0, rusak: 0, jadwal: 0 });
  const [conditionData, setConditionData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const supabaseRef = useRef(createClient());

  const load = async () => {
    setLoading(true);
    const supabase = supabaseRef.current;
    const { data: assets } = await supabase.from("assets").select("*");
    const { data: schedules } = await supabase
      .from("maintenance_schedules")
      .select("*, assets(name, code)")
      .in("status", ["upcoming", "ongoing"])
      .order("scheduled_date", { ascending: true })
      .limit(5);

    if (assets && assets.length > 0) {
      const total = assets.length;
      const aktif = assets.filter((a) => a.status === "aktif").length;
      const rusak = assets.filter((a) => a.condition !== "baik").length;
      setStats({ total, aktif, rusak, jadwal: schedules?.length ?? 0 });

      const cond = ["baik", "rusak_ringan", "rusak_berat"].map((c) => ({
        name: c === "baik" ? "Baik" : c === "rusak_ringan" ? "Rusak Ringan" : "Rusak Berat",
        value: assets.filter((a) => a.condition === c).length,
      }));

      setConditionData(cond);

      const catMap = new Map<string, number>();
      assets.forEach((a) => catMap.set(a.category, (catMap.get(a.category) ?? 0) + 1));
      setCategoryData(Array.from(catMap, ([name, value]) => ({ name, value })).slice(0, 6));
    }
    setUpcoming(schedules ?? []);
    setLoading(false);
  };

  useEffect(() => {
    (async () => await load())();
  }, []);

  const COLORS = ["hsl(142 71% 45%)", "hsl(38 92% 50%)", "hsl(0 84% 60%)"];
  const emailLocal = user?.email?.split("@")[0] ?? "Pengguna";
  const letters = emailLocal.replace(/[^a-zA-Z]/g, "");
  const greetName = letters.length >= 2 ? letters : emailLocal;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Selamat datang, <span className="capitalize">{role}</span> <span className="text-gradient capitalize">{greetName}</span>!
        </h1>
        <p className="text-muted-foreground mt-1">Ringkasan aset dan maintenance kampus hari ini.</p>
      </div>

      <div className={`grid gap-4 md:grid-cols-2 ${role === "admin" ? "lg:grid-cols-4" : "lg:grid-cols-3"} `}>
        {role === "admin" ? (
          <>
          <StatCard title="Total Aset" value={stats.total} icon={Boxes} variant="primary" />
          <StatCard title="Aset Aktif" value={stats.aktif} icon={CheckCircle2} variant="success" />
          <StatCard title="Aset Rusak" value={stats.rusak} icon={AlertTriangle} variant="destructive" />
          </>

        ):(
          <>
          <StatCard title="Total Aset Rusak" value={stats.total} icon={Boxes} variant="primary" />
          <StatCard title="Total Perbaikan Selesai" value={stats.aktif} icon={CheckCircle2} variant="success" />
          </>
        )}
        <StatCard title="Jadwal Hari Ini" value={stats.jadwal} icon={CalendarClock} variant="warning" />
      </div>

      {role === "admin" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="order-2 p-6 card-elevated border-0 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Distribusi Aset per Kategori</h3>
                {/* <p className="text-xs text-muted-foreground">Top 6 kategori</p> */}
              </div>
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            {categoryData.length === 0 ? (
              <div className="h-[280px] flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                <Boxes className="h-8 w-8 opacity-30" />
                <p>Belum ada data aset</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryData}>
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  <Bar dataKey="value" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card className="order-1 p-6 card-elevated border-0">
            <h3 className="font-semibold mb-1">Kondisi Aset</h3>
            <p className="text-xs text-muted-foreground mb-4">Persentase kondisi</p>
            {conditionData.every((c) => c.value === 0) ? (
              <div className="h-60 flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                <CheckCircle2 className="h-8 w-8 opacity-30" />
                <p>Belum ada data kondisi</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={conditionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {conditionData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>
      )}

      <Card className="p-6 card-elevated border-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Jadwal Maintenance Terdekat</h3>
            <p className="text-xs text-muted-foreground">{upcoming.length} jadwal berikutnya</p>
          </div>
        </div>
        {loading ?
          <div className="flex flex-col items-center justify-center gap-1 h-32">
            <p className="text-lg  text-muted-foreground mt-1">Memuat data</p>
            <Loader2 className="animate-spin text-primary" />
          </div>
          :
          upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Tidak ada jadwal aktif.</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg hover:bg-secondary/50 transition-colors border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <CalendarClock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{s.assets?.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.assets?.code} · {format(new Date(s.scheduled_date), "EEEE, d MMM yyyy", { locale: idLocale })}
                      </p>
                    </div>
                  </div>
                  <StatusBadge value={s.status} />
                </div>
              ))}
            </div>
          )
        }
      </Card>
    </div>
  )
}

export default Dashboard
