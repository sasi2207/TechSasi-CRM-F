import { useEffect, useState } from "react";
import api from "@/lib/api";
import DataTable, { StatusBadge } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

const STAGES = ["new", "qualified", "proposal", "negotiation", "won", "lost"];
const empty = { name: "", email: "", phone: "", source: "Website", interest: "", stage: "new", value: 0, assigned_to: "", notes: "" };

export default function Leads() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [stageFilter, setStageFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/leads", { params: stageFilter !== "all" ? { stage: stageFilter } : {} });
      setRows(data);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [stageFilter]);

  const save = async () => {
    const payload = { ...form, value: Number(form.value) || 0 };
    try {
      if (editingId) await api.put(`/leads/${editingId}`, payload); else await api.post("/leads", payload);
      toast.success("Saved"); setOpen(false); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };
  const remove = async (id) => { if (!confirm("Delete this lead?")) return; await api.delete(`/leads/${id}`); toast.success("Deleted"); load(); };
  const advance = async (row) => {
    const idx = STAGES.indexOf(row.stage);
    if (idx < 0 || idx >= STAGES.length - 2) return;
    await api.put(`/leads/${row.id}`, { ...row, stage: STAGES[idx + 1] });
    toast.success(`Moved to ${STAGES[idx + 1]}`); load();
  };

  const columns = [
    { key: "name", header: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "email", header: "Email", className: "text-muted-foreground" },
    { key: "source", header: "Source" },
    { key: "interest", header: "Interest" },
    { key: "stage", header: "Stage", render: (r) => <StatusBadge value={r.stage} /> },
    { key: "value", header: "Value", className: "text-right", render: (r) => <span className="font-mono-jb text-xs">₹{Number(r.value || 0).toLocaleString("en-IN")}</span> },
    { key: "assigned_to", header: "Owner", className: "text-muted-foreground" },
  ];

  return (
    <>
      <DataTable
        title="CRM · Leads"
        description="Sales pipeline from first contact to won."
        data={rows} loading={loading} columns={columns}
        onAdd={() => { setForm(empty); setEditingId(null); setOpen(true); }}
        addLabel="Add lead" addTestId="add-lead-btn"
        searchKeys={["name", "email", "phone", "interest", "assigned_to"]}
        toolbar={
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger data-testid="lead-stage-filter" className="w-[140px] h-9 rounded-full">
              <SelectValue placeholder="All stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stages</SelectItem>
              {STAGES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
            </SelectContent>
          </Select>
        }
        rowActions={(row) => (
          <div className="flex justify-end gap-1">
            <Button size="sm" variant="ghost" data-testid={`advance-lead-${row.id}`} onClick={() => advance(row)} className="text-primary">Advance →</Button>
            <Button size="icon" variant="ghost" onClick={() => { setForm({ ...empty, ...row }); setEditingId(row.id); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => remove(row.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        )}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? "Edit lead" : "Add lead"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>Source</Label><Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} /></div>
            <div><Label>Interest</Label><Input value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })} /></div>
            <div><Label>Value (₹)</Label><Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></div>
            <div><Label>Stage</Label>
              <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STAGES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Assigned to</Label><Input value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
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
