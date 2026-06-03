"use client"

import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
}

const variants = {
  default: "bg-secondary text-secondary-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-green-500/10 text-green-500",
  warning: "bg-yellow-500/10 text-yellow-500",
  destructive: "bg-destructive/10 text-destructive",
};

const StatCard = ({ title, value, icon: Icon, trend, variant = "default" }: Props) => {
  return (
    <Card className="p-5 card-elevated border-0 group">
      <div className="flex items-center gap-4">
        <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0", variants[variant])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground truncate">{title}</p>
          <p className="text-2xl font-bold tracking-tight leading-tight">{value}</p>
        </div>
      </div>
      {trend && (
        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/60">
          {trend}
        </p>
      )}
    </Card>
  );
}

export default StatCard;