/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "sonner";

export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  if (rows.length === 0) {
    toast.error("Tidak ada data untuk diekspor");
    return;
  }
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => {
      const v = r[h] ?? "";
      const s = String(v).replace(/"/g, '""');
      return `"${s}"`;
    }).join(",")),
  ].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToPDF(title: string, rows: Record<string, any>[]) {
  if (rows.length === 0) {
    toast.error("Tidak ada data untuk diekspor");
    return;
  }
  const headers = Object.keys(rows[0]);
  const html = `
    <html><head><title>${title}</title>
    <style>
      body { font-family: Inter, system-ui, sans-serif; padding: 24px; color: #0f172a; }
      h1 { color: #2563eb; margin: 0 0 4px; }
      .sub { color: #64748b; font-size: 12px; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th { background: #eff6ff; color: #2563eb; padding: 10px; text-align: left; border-bottom: 2px solid #2563eb; }
      td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
      tr:nth-child(even) td { background: #f8fafc; }
      .footer { margin-top: 24px; font-size: 11px; color: #94a3b8; text-align: right; }
    </style></head><body>
    <h1>ASSETRA — ${title}</h1>
    <div class="sub">Diekspor pada ${new Date().toLocaleString("id-ID")}</div>
    <table>
      <thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((r) => `<tr>${headers.map((h) => `<td>${r[h] ?? ""}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
    <div class="footer">ASSETRA · Assets Era Management System</div>
    </body></html>`;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  setTimeout(() => w.print(), 300);
}
