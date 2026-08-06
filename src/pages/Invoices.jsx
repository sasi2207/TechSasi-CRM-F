import { useEffect, useState } from "react";
import api from "@/lib/api";
import DataTable, { StatusBadge } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

const STATUSES = ["draft", "sent", "paid", "overdue"];
const empty = { invoice_number: "", client: "", amount: 0, tax: 0, total: 0, status: "draft", items: [] };

export default function Invoices() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  const load = async () => { setLoading(true); try { const { data } = await api.get("/invoices"); setRows(data); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const amount = Number(form.amount) || 0;
    const tax = Number(form.tax) || 0;
    const payload = { ...form, amount, tax, total: amount + tax };
    try {
      if (editingId) await api.put(`/invoices/${editingId}`, payload); else await api.post("/invoices", payload);
      toast.success("Saved"); setOpen(false); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };
  const remove = async (id) => { if (!confirm("Delete this invoice?")) return; await api.delete(`/invoices/${id}`); toast.success("Deleted"); load(); };

  const columns = [
    { key: "invoice_number", header: "Number", render: (r) => <span className="font-mono-jb text-xs">{r.invoice_number}</span> },
    { key: "client", header: "Client", render: (r) => <span className="font-medium">{r.client}</span> },
    { key: "amount", header: "Amount", className: "text-right", render: (r) => <span className="font-mono-jb text-xs">₹{Number(r.amount || 0).toLocaleString("en-IN")}</span> },
    { key: "tax", header: "Tax", className: "text-right", render: (r) => <span className="font-mono-jb text-xs">₹{Number(r.tax || 0).toLocaleString("en-IN")}</span> },
    { key: "total", header: "Total", className: "text-right", render: (r) => <span className="font-mono-jb font-semibold text-xs">₹{Number(r.total || 0).toLocaleString("en-IN")}</span> },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <>
      <DataTable
        title="Invoices"
        description="Quotations, sent invoices and payment status."
        data={rows} loading={loading} columns={columns}
        onAdd={() => { setForm(empty); setEditingId(null); setOpen(true); }}
        addLabel="New invoice" addTestId="add-invoice-btn"
        searchKeys={["invoice_number", "client"]}
        rowActions={(row) => (
          <div className="flex justify-end gap-1">
            <Button size="icon" variant="ghost" onClick={() => { setForm({ ...empty, ...row }); setEditingId(row.id); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => remove(row.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        )}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? "Edit invoice" : "New invoice"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-1"><Label>Invoice #</Label><Input value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} /></div>
            <div className="col-span-1"><Label>Client</Label><Input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} /></div>
            <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
            <div><Label>Tax</Label><Input type="number" value={form.tax} onChange={(e) => setForm({ ...form, tax: e.target.value })} /></div>
            <div className="col-span-2"><Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2 text-sm text-muted-foreground">
              Total: <span className="font-mono-jb font-semibold text-foreground">₹{(Number(form.amount) + Number(form.tax || 0)).toLocaleString("en-IN")}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="btn-gradient" onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
