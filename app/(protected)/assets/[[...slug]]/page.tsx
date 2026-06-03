"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
import { use, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Search, Download, Loader2, Upload, Eye, Computer, ComputerIcon, Tag, Calendar, Building2, Building, DoorOpen, Wrench, Notebook } from "lucide-react";
import { ConditionBadge, StatusBadge } from "@/components/Badges";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { exportToCSV, exportToPDF } from "@/lib/exporters";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createClient } from "@/supabase/client";
import Image from "next/image";
import { FieldLabel } from "@/components/ui/field";

const PAGE_SIZE = 10;

const empty = {
  code: "", name: "", category: "Komputer", building: "", floor: "", room: "",
  condition: "baik", status: "aktif", purchase_date: "", notes: "", condition_desc: "", faculty: ""
};

const Assets = ({ params }: { params: Promise<{ slug?: string[] }> }) => {
  const param = use(params);
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const [search, setSearch] = useState(param?.slug?.[0] ?? "");
  const [items, setItems] = useState<any[]>([]);
  const [filterCondition, setFilterCondition] = useState("semua kondisi");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [openCSVModal, setOpenCSVModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [delId, setDelId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const supabaseRef = useRef(createClient());

  // CSV States
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [uploadingCSV, setUploadingCSV] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const supabase = supabaseRef.current;
    const { data, error } = await supabase.from("assets").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await load();
    })()
  }, []);

  useEffect(() => {
    (async () => {
      const q = param?.slug?.[0] ?? "";
      setSearch(q);
      setPage(1);
    })()
  }, [param]);

  const filtered = items.filter((a) => {
    const s = search.toLowerCase();
    const matchSearch = !s || a.name.toLowerCase().includes(s) || a.code.toLowerCase().includes(s)
      || (a.building ?? "").toLowerCase().includes(s) || (a.room ?? "").toLowerCase().includes(s);
    const matchCond = filterCondition === "semua kondisi" || a.condition === filterCondition;
    return matchSearch && matchCond;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openNew = () => {
    setEditing(null);
    setForm({ ...empty, code: `AST-${Date.now().toString(36).toUpperCase()}` });
    setOpen(true);
  };

  const openEdit = (a: any) => {
    setEditing(a);
    setForm({ ...a, purchase_date: a.purchase_date ?? "" });
    setOpen(true);
  };

  const openDetail = (a: any) => {
    setForm({ ...a, purchase_date: a.purchase_date ?? "" })
    setOpenDetailModal(true);
  }

  const openCSV = () => {
    setOpenCSVModal(true);
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim() || !form.category.trim() || !form.building.trim() || !form.floor.trim() || !form.room.trim() || !form.condition.trim() || !form.status.trim() || !form.condition_desc.trim() || !form.faculty.trim()) {
      toast.error("Semua field wajib diisi");
      return;
    };

    const supabase = supabaseRef.current;
    const payload = { ...form, purchase_date: form.purchase_date || null };
    if (editing) {
      const { error } = await supabase.from("assets").update(payload).eq("id", editing.id);
      if (error) return toast.error("Aset gagal diubah");
      toast.success("Aset berhasil diubah");
    } else {
      const { error } = await supabase.from("assets").insert(payload);
      if (error) return toast.error("Aset gagal ditambahkan");
      toast.success("Aset berhasil ditambahkan");
    }
    setOpen(false);
    load();
  };

  const confirmDelete = async () => {
    if (!delId) return;
    const supabase = supabaseRef.current;
    const { error } = await supabase.from("assets").delete().eq("id", delId);
    if (error) toast.error("Aset gagal dihapus");
    else toast.success("Aset berhasil dihapus");
    setDelId(null);
    load();
  };

  // --- CSV Logic ---
  const VALID_CATEGORIES = ["Komputer", "AC", "Proyektor", "Printer", "Furnitur", "Jaringan", "Lainnya"];
  const VALID_CONDITIONS = ["baik", "rusak ringan", "rusak_ringan", "rusak berat", "rusak_berat"];
  const VALID_STATUSES = ["aktif", "nonaktif", "maintenance"];

  const normalizeCondition = (val: string) => {
    const v = val.trim().toLowerCase();
    if (v === "baik") return "baik";
    if (v === "rusak ringan" || v === "rusak_ringan") return "rusak_ringan";
    if (v === "rusak berat" || v === "rusak_berat") return "rusak_berat";
    return null;
  };

  const normalizeCategory = (val: string) => {
    return VALID_CATEGORIES.find((c) => c.toLowerCase() === val.trim().toLowerCase()) ?? null;
  };

  const parseCSV = (text: string): any[] => {
    const clean = text.replace(/^\uFEFF/, "");
    const lines = clean.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const delimiter = lines[0].includes(";") ? ";" : ",";

    const parseRow = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
          else inQuotes = !inQuotes;
        } else if (ch === delimiter && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += ch;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseRow(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, "_"));
    const rows: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseRow(lines[i]);
      const row: any = {};
      headers.forEach((h, idx) => { row[h] = values[idx] ?? ""; });
      rows.push(row);
    }
    return rows;
  };

  const processCSVFile = (file: File) => {
    setCsvFile(file);
    setCsvPreview([]);
    setCsvErrors([]);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length === 0) {
        setCsvErrors(["File CSV kosong atau format tidak dikenali."]);
        return;
      }
      const errors: string[] = [];
      const validated = rows.map((row, idx) => {
        const rowNum = idx + 2;
        const name = row["nama_aset"] || row["nama"] || row["name"] || "";
        const code = row["kode_aset"] || row["kode"] || row["code"] || `AST-${Date.now().toString(36).toUpperCase()}-${idx}`;
        const category = normalizeCategory(row["kategori"] || row["category"] || "");
        const building = row["gedung"] || row["building"] || "";
        const floor = row["lantai"] || row["floor"] || "";
        const room = row["ruang"] || row["room"] || "";
        const faculty = row["fakultas"] || row["faculty"] || "";
        const condition = normalizeCondition(row["kondisi"] || row["condition"] || "");
        const status = (row["status"] || "aktif").trim().toLowerCase();
        const purchase_date = row["tanggal_pembelian"] || row["purchase_date"] || "";
        const notes = row["catatan"] || row["notes"] || "";
        const condition_desc = row["deskripsi_kondisi"] || row["condition_desc"] || "";

        if (!name) errors.push(`Baris ${rowNum}: Nama aset wajib diisi.`);
        if (!category) errors.push(`Baris ${rowNum}: Kategori tidak valid (${row["kategori"] || row["category"]}). Gunakan: ${VALID_CATEGORIES.join(", ")}.`);
        if (!condition) errors.push(`Baris ${rowNum}: Kondisi tidak valid (${row["kondisi"] || row["condition"]}). Gunakan: baik, rusak ringan, rusak berat.`);
        if (!building) errors.push(`Baris ${rowNum}: Gedung wajib diisi.`);
        if (!floor) errors.push(`Baris ${rowNum}: Lantai wajib diisi.`);
        if (!room) errors.push(`Baris ${rowNum}: Ruang wajib diisi.`);
        if (!faculty) errors.push(`Baris ${rowNum}: Fakultas wajib diisi.`);
        if (!condition_desc) errors.push(`Baris ${rowNum}: Deskripsi kondisi wajib diisi.`);
        if (!VALID_STATUSES.includes(status)) errors.push(`Baris ${rowNum}: Status tidak valid (${status}). Gunakan: aktif, nonaktif, maintenance.`);

        return {
          code, name, category, building, floor, room, faculty,
          condition, status,
          purchase_date: purchase_date || null,
          notes, condition_desc,
        };
      });

      setCsvErrors(errors);
      setCsvPreview(validated);
    };
    reader.readAsText(file);
  };

  const handleCSVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processCSVFile(file);
  };

  const handleUploadCSV = async () => {
    if (!csvFile || csvPreview.length === 0) {
      toast.error("Pilih file CSV terlebih dahulu.");
      return;
    }
    if (csvErrors.length > 0) {
      toast.error(`Terdapat ${csvErrors.length} kesalahan pada CSV. Perbaiki terlebih dahulu.`);
      return;
    }
    const supabase = supabaseRef.current;
    setUploadingCSV(true);
    try {
      const { error } = await supabase.from("assets").insert(csvPreview);
      if (error) {
        toast.error("Aset gagal diimport!");
      } else {
        toast.success(`${csvPreview.length} aset berhasil diimport!`);
        setOpenCSVModal(false);
        setCsvFile(null);
        setCsvPreview([]);
        setCsvErrors([]);
        if (csvInputRef.current) csvInputRef.current.value = "";
        load();
      }
    } catch (err: any) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setUploadingCSV(false);
    }
  };

  const downloadCSVTemplate = () => {
    const header = "kode_aset,nama_aset,kategori,fakultas,gedung,lantai,ruang,kondisi,deskripsi_kondisi,status,tanggal_pembelian,catatan";
    const example = 'AST-001,Laptop Dell Inspiron,Komputer,FMIPA,GIK,2,Lab Komputer 1,baik,"Laptop berfungsi normal tanpa kerusakan",aktif,2023-05-15,"Dibeli dari anggaran 2023"';
    const csv = `${header}\n${example}`;
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_import_aset.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Template CSV berhasil diunduh!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Aset</h1>
          <p className="text-muted-foreground mt-1">Kelola seluruh aset kampus.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="cursor-pointer px-4 bg-white shadow-[0px_0px_2px_0px_rgba(0,0,0,0.2)]" onClick={openCSV}><Upload className="h-4 w-4" />CSV</Button>
          {isAdmin && (
            <Button onClick={openNew} className="cursor-pointer">
              <Plus className="h-4 w-4" />Tambah Aset
            </Button>
          )}
        </div>
      </div>

      <Card className="p-4 card-elevated border-0">
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-50">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari kode, nama, lokasi..." className="pl-9"
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <Select value={filterCondition} onValueChange={(v) => { setFilterCondition(v as any); setPage(1); }}>
            <SelectTrigger className="w-45 capitalize"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="semua kondisi">Semua Kondisi</SelectItem>
              <SelectItem value="baik">Baik</SelectItem>
              <SelectItem value="rusak ringan">Rusak Ringan</SelectItem>
              <SelectItem value="rusak berat">Rusak Berat</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ?
          <div className="flex flex-col items-center justify-center gap-1 h-32">
            <p className="text-lg  text-muted-foreground mt-1">Memuat data</p>
            <Loader2 className="animate-spin text-primary" />
          </div> :
          <>
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary hover:bg-primary/90">
                    <TableHead className="text-white">Kode</TableHead>
                    <TableHead className="text-white">Nama</TableHead>
                    <TableHead className="text-white">Kategori</TableHead>
                    <TableHead className="text-white">Lokasi</TableHead>
                    <TableHead className="text-white">Kondisi</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    {isAdmin && <TableHead className="text-center text-white">Aksi</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.length === 0 ? (
                    <TableRow><TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-12 text-muted-foreground">
                      Tidak ada aset.
                    </TableCell></TableRow>
                  ) : paged.map((a) => (
                    <TableRow key={a.id} className="hover:bg-secondary/30">
                      <TableCell className="font-mono text-xs">{a.code}</TableCell>
                      <TableCell className="font-medium">{a.name}</TableCell>
                      <TableCell>{a.category}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {[a.building, "L " + a.floor, a.room].filter(Boolean).join(", ") || "—"}
                      </TableCell>
                      <TableCell><ConditionBadge value={a.condition} /></TableCell>
                      <TableCell><StatusBadge value={a.status} /></TableCell>
                      {isAdmin && (
                        <TableCell className="text-center space-x-1">
                          <Button size="icon" variant="ghost" className="hover:bg-primary/20! bg-primary/10 cursor-pointer" onClick={() => openDetail(a)}><Eye className="h-4 w-4 text-primary" /></Button>
                          <Button size="icon" variant="ghost" className="hover:bg-yellow-500/20! bg-yellow-500/10 cursor-pointer" onClick={() => openEdit(a)}><Pencil className="h-4 w-4 text-yellow-500" /></Button>
                          <Button size="icon" variant="ghost" className="hover:bg-destructive/20! bg-destructive/10 cursor-pointer" onClick={() => setDelId(a.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Menampilkan {paged.length} dari {filtered.length} aset
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                <span className="text-sm flex items-center px-3">Hal {page} / {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
              </div>
            </div>
          </>
        }
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-xl overflow-y-auto h-[95vh]">
          <DialogHeader>
            <DialogTitle className={"font-poppins text-xl font-semibold"}>{editing ? "Edit Aset" : "Tambah Aset Baru"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit}>
            <section className="space-y-4 p-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="after:content-['*'] after:-ml-1 after:text-destructive">Kode Aset</Label>
                  <Input readOnly value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label className="after:content-['*'] after:-ml-1 after:text-destructive">Nama Aset</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Laptop..." required />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className="after:content-['*'] after:-ml-1 after:text-destructive">Kondisi Aset</Label>
                  <Input value={form.condition_desc} onChange={(e) => setForm({ ...form, condition_desc: e.target.value })} placeholder="Kondisi aset..." required />
                </div>
                <div className="space-y-2">
                  <Label className="after:content-['*'] after:-ml-1 after:text-destructive">Kategori</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Komputer", "AC", "Proyektor", "Printer", "Furnitur", "Jaringan", "Lainnya"].map((c) =>
                        <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="after:content-['*'] after:-ml-1 after:text-destructive">Tanggal Pembelian</Label>
                  <Input type="date" value={form.purchase_date}
                    onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="after:content-['*'] after:-ml-1 after:text-destructive">Fakultas</Label>
                  <Input value={form.faculty} placeholder="FMIPA..." onChange={(e) => setForm({ ...form, faculty: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="after:content-['*'] after:-ml-1 after:text-destructive">Gedung</Label>
                  <Input value={form.building} placeholder="GIK..." onChange={(e) => setForm({ ...form, building: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="after:content-['*'] after:-ml-1 after:text-destructive">Ruang</Label>
                  <Input value={form.room} placeholder="MIPA T..." onChange={(e) => setForm({ ...form, room: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="after:content-['*'] after:-ml-1 after:text-destructive">Lantai</Label>
                  <Input value={form.floor} placeholder="2" onChange={(e) => setForm({ ...form, floor: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="after:content-['*'] after:-ml-1 after:text-destructive">Kondisi</Label>
                  <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baik">Baik</SelectItem>
                      <SelectItem value="rusak_ringan">Rusak Ringan</SelectItem>
                      <SelectItem value="rusak_berat">Rusak Berat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="after:content-['*'] after:-ml-1 after:text-destructive">Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aktif">Aktif</SelectItem>
                      <SelectItem value="nonaktif">Nonaktif</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Catatan</Label>
                  <Textarea value={form.notes ?? ""} placeholder="Catatan aset..." onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
            </section>
            <DialogFooter>
              <Button type="button" className="cursor-pointer" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" className="cursor-pointer">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Detail */}
      <Dialog open={openDetailModal} onOpenChange={setOpenDetailModal}>
        <DialogContent className={'p-6'}>
          <DialogHeader>
            <DialogTitle className={"font-poppins text-lg font-semibold"}>Detail Aset</DialogTitle>
          </DialogHeader>
          <section className="space-y-6">
            <Card className="bg-primary/10 flex flex-row items-center gap-4 px-4! p-2">
              <div className="p-3 rounded-xl bg-white shadow">
                <Image className="size-10 object-cover" src="/assets/komputer.svg" alt="icon computer" width={50} height={50} />
              </div>
              <section>
                <p className="text-primary text-xs font-semibold">{form.code}</p>
                <h2 className="font-bold text-lg">{form.name}</h2>
                <section className="flex items-center gap-2">
                  <ConditionBadge value={form.condition} />
                  <StatusBadge value={form.status} />
                </section>
              </section>
            </Card>
            <section className="grid grid-cols-2 gap-4">
              <Card className="bg-primary/10 space-y-1 px-4! p-2">
                <h4 className="flex items-center gap-2 text-xs text-muted-foreground"><Tag className="size-3" /> Kategori</h4>
                <p className="font-bold">{form.category}</p>
              </Card>
              <Card className="bg-primary/10 space-y-1 px-4! p-2">
                <h4 className="flex items-center gap-2 text-xs text-muted-foreground"><Calendar className="size-3" /> Tanggal Masuk</h4>
                <p className="font-bold">{form.purchase_date}</p>
              </Card>
            </section>
            <section className="flex items-center gap-4">
              <Card className="bg-primary/10 space-y-1 px-4! p-2 flex-1">
                <h4 className="flex items-center gap-2 text-xs text-muted-foreground"><Building2 className="size-3" /> Fakultas</h4>
                <p className="font-bold">{form.faculty}</p>
              </Card>
              <Card className="bg-primary/10 space-y-1 px-4! p-2 flex-2">
                <h4 className="flex items-center gap-2 text-xs text-muted-foreground"><Building className="size-3" /> Gedung</h4>
                <p className="font-bold">{form.building}</p>
              </Card>
              <Card className="bg-primary/10 space-y-1 px-4! p-2 flex-2">
                <h4 className="flex items-center gap-2 text-xs text-muted-foreground"><DoorOpen className="size-3" /> Lantai & Ruangan</h4>
                <p className="font-bold">Lantai {form.floor} - {form.room}</p>
              </Card>
            </section>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground flex items-center gap-1"><Wrench className="size-4" /> Deskripsi Kondisi Aset</Label>
              <Textarea rows={1} readOnly value={form.condition_desc} className="bg-primary/10 resize-none" required />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground flex items-center gap-1"><Notebook className="size-4" /> Catatan</Label>
              <Textarea rows={1} readOnly value={form.notes || "Tidak ada catatan"} className="bg-yellow-500/10 resize-none italic" required />
            </div>
          </section>
        </DialogContent>
      </Dialog>

      <Dialog open={openCSVModal} onOpenChange={(o) => { setOpenCSVModal(o); if (!o) { setCsvFile(null); setCsvPreview([]); setCsvErrors([]); if (csvInputRef.current) csvInputRef.current.value = ""; } }}>
        <DialogContent className="p-6 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-poppins text-lg font-semibold">Import Aset via CSV</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-primary">📋 Panduan Import CSV</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>File harus berformat <b>.csv</b> (koma atau titik koma sebagai pemisah)</li>
                <li>Kolom wajib: <code className="bg-muted px-1 rounded text-[11px]">nama_aset, kategori, gedung, lantai, ruang, fakultas, kondisi, deskripsi_kondisi</code></li>
                <li>Nilai kondisi: <b>baik</b>, <b>rusak ringan</b>, <b>rusak berat</b></li>
                <li>Nilai status: <b>aktif</b>, <b>nonaktif</b>, <b>maintenance</b></li>
                <li>Kategori: Komputer, AC, Proyektor, Printer, Furnitur, Jaringan, Lainnya</li>
                <li>Tanggal format: <b>YYYY-MM-DD</b> (contoh: 2024-01-15)</li>
              </ul>
              <Button size="sm" variant="outline" className="cursor-pointer mt-2 gap-2" onClick={downloadCSVTemplate}>
                <Download className="h-3.5 w-3.5" /> Unduh Template CSV
              </Button>
            </div> */}

            <div className="space-y-2">
              <FieldLabel className="after:content-['*'] after:-ml-1 after:text-destructive">Pilih File CSV</FieldLabel>
              <Input
                ref={csvInputRef}
                type="file"
                accept=".csv"
                className="file:py-1.5 file:px-2 file:mr-2! file:text-white file:h-auto! file:bg-primary file:rounded-lg file:cursor-pointer file:font-semibold p-2 h-auto"
                onChange={handleCSVFileChange}
              />
            </div>

            {/* Errors */}
            {csvErrors.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 max-h-36 overflow-y-auto">
                <p className="text-xs font-semibold text-destructive mb-2">⚠️ {csvErrors.length} kesalahan ditemukan — perbaiki file CSV Anda:</p>
                <ul className="text-xs text-destructive space-y-0.5 list-disc list-inside">
                  {csvErrors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            )}

            {/* {csvPreview.length > 0 && csvErrors.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-green-600">✅ {csvPreview.length} aset siap diimpor — pratinjau:</p>
                <div className="overflow-x-auto rounded-lg border border-border max-h-48">
                  <table className="text-xs w-full">
                    <thead className="bg-secondary/50">
                      <tr>
                        <th className="px-2 py-1.5 text-left font-semibold">Kode</th>
                        <th className="px-2 py-1.5 text-left font-semibold">Nama</th>
                        <th className="px-2 py-1.5 text-left font-semibold">Kategori</th>
                        <th className="px-2 py-1.5 text-left font-semibold">Gedung</th>
                        <th className="px-2 py-1.5 text-left font-semibold">Kondisi</th>
                        <th className="px-2 py-1.5 text-left font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.slice(0, 10).map((row, i) => (
                        <tr key={i} className="border-t border-border hover:bg-secondary/20">
                          <td className="px-2 py-1 font-mono">{row.code}</td>
                          <td className="px-2 py-1">{row.name}</td>
                          <td className="px-2 py-1">{row.category}</td>
                          <td className="px-2 py-1">{row.building}</td>
                          <td className="px-2 py-1">{row.condition}</td>
                          <td className="px-2 py-1">{row.status}</td>
                        </tr>
                      ))}
                      {csvPreview.length > 10 && (
                        <tr><td colSpan={6} className="text-center text-muted-foreground px-2 py-1.5">...dan {csvPreview.length - 10} baris lainnya</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )} */}
          </div>

          <p className="text-sm text-destructive italic">Catatan: File csv harus memiliki struktur yang sama dengan tabel manajemen aset</p>

          <div className="flex items-center justify-end gap-2 pt-2">
            {/* <Button variant="outline" className="cursor-pointer" onClick={() => setOpenCSVModal(false)}>Batal</Button> */}
            <Button
              className="cursor-pointer"
              onClick={handleUploadCSV}
              disabled={uploadingCSV || !csvFile || csvErrors.length > 0 || csvPreview.length === 0}
            >
              {uploadingCSV ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Mengimpor...</> : <>Upload {csvPreview.length > 0 ? `(${csvPreview.length} aset)` : ""}</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!delId} onOpenChange={(o) => !o && setDelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={"font-poppins text-lg font-semibold"}>Hapus Aset</AlertDialogTitle>
            <AlertDialogDescription>Apakah anda yakin ingin menghapus aset ini?</AlertDialogDescription>
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


export default Assets;