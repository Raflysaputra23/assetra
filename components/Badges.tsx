import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const conditionMap: Record<string, { label: string; cls: string }> = {
  baik: { label: "Baik", cls: "bg-primary/10 text-primary border-primary/20" },
  rusak_ringan: { label: "Rusak Ringan", cls: "bg-yellow-500/10 text-yellow-500 border-warning/20" },
  rusak_berat: { label: "Rusak Berat", cls: "bg-destructive/10 text-destructive border-destructive/20" },
};

const statusMap: Record<string, { label: string; cls: string }> = {
  aktif: { label: "Aktif", cls: "bg-green-500/10 text-green-500 border-green-500/20" },
  nonaktif: { label: "Nonaktif", cls: "bg-muted text-muted-foreground border-border" },
  maintenance: { label: "Maintenance", cls: "bg-primary text-primary border-primary/20" },
  upcoming: { label: "Akan Datang", cls: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
  ongoing: { label: "Berlangsung", cls: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  completed: { label: "Selesai", cls: "bg-green-500/10 text-green-500 border-green-500/20" },
  missed: { label: "Terlewat", cls: "bg-destructive/10 text-destructive border-destructive/20" },
  pending: { label: "Pending", cls: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
};

const priorityMap: Record<string, { label: string; cls: string }> = {
  tinggi: { label: "Tinggi", cls: "bg-destructive/10 text-destructive border-destructive/20" },
  sedang: { label: "Sedang", cls: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  rendah: { label: "Rendah", cls: "bg-muted text-muted-foreground border-border" },
};

export function ConditionBadge({ value }: { value: string }) {
  const c = conditionMap[value] ?? { label: value, cls: "" };
  return <Badge variant="outline" className={cn("font-medium", c.cls)}>{c.label}</Badge>;
}
export function StatusBadge({ value }: { value: string }) {
  const c = statusMap[value] ?? { label: value, cls: "" };
  return <Badge variant="outline" className={cn("font-medium", c.cls)}>{c.label}</Badge>;
}
export function PriorityBadge({ value }: { value: string }) {
  const c = priorityMap[value] ?? { label: value, cls: "" };
  return <Badge variant="outline" className={cn("font-medium", c.cls)}>{c.label}</Badge>;
}
