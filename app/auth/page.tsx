"use client"

import { Card } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import FormLogin from "@/components/FormLogin";
import Image from "next/image";

export default function Auth() {

  return (
    <div className="h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-soft">
      <div className="hidden lg:flex gradient-hero relative p-12 flex-col justify-between text-primary-foreground">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Image src={"/assets/box.svg"} alt="logo assetra" width={30} height={30} />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">ASSETRA</h2>
              <p className="text-xs uppercase tracking-widest opacity-80">Assets Era</p>
            </div>
          </div>
        </div>
        <div className="relative space-y-4">
          <h1 className="text-4xl font-bold leading-tight">
            Manajemen Aset Kampus<br />Era Digital.
          </h1>
          <p className="text-lg opacity-90 max-w-md">
            Kelola, monitor, dan rawat semua aset kampus dalam satu platform modern. Dari reaktif menjadi preventif.
          </p>
        </div>
        <div className="relative grid grid-cols-3 gap-4 text-sm">
          {[
            { label: "Aset Terkelola", val: "1.2K+", icon: "box.svg" },
            { label: "Maintenance", val: "Otomatis", icon: "history.svg" },
            { label: "Real-time", val: "24/7", icon: "real-time.svg" },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 backdrop-blur flex items-center gap-3 rounded-xl p-3 border border-white/10">
              <Image src={`/assets/${s.icon}`} alt="icon" width={24} height={24} />
              <div className="flex flex-col">
                <h4 className="text-xl font-bold">{s.val}</h4>
                <p className="text-xs opacity-80">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center items-start p-6 overflow-y-auto overflow-x-hidden">
        <Card className="w-full max-w-md m-auto p-8 gap-1 shadow-lg border-0 bg-card/80 backdrop-blur-xl animate-scale-in">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">ASSETRA</span>
          </div>
          <h2 className="text-2xl font-bold text-center lg:text-start">Selamat Datang</h2>
          <p className="text-sm text-muted-foreground mb-6 text-center lg:text-start">Silahkan login akun anda untuk masuk ke dashboard Assetra</p>
          <FormLogin />
        </Card>
      </div>
    </div>
  );
}
