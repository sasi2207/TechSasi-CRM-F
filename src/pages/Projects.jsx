import { useEffect, useState } from "react";
import api from "@/lib/api";
import DataTable, { StatusBadge } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

const STATUSES = ["planning", "in_progress", "completed"];
const empty = { code: "", name: "", client: "", manager: "", status: "planning", progress: 0, budget: 0, description: "" };

export default function Projects() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  const load = async () => { setLoading(true); try { const { data } = await api.get("/projects"); setRows(data); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const payload = { ...form, progress: Number(form.progress) || 0, budget: Number(form.budget) || 0 };
    try {
      if (editingId) await api.put(`/projects/${editingId}`, payload); else await api.post("/projects", payload);
      toast.success("Saved"); setOpen(false); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };
  const remove = async (id) => { if (!confirm("Delete?")) return; await api.delete(`/projects/${id}`); toast.success("Deleted"); load(); };

  const columns = [
    { key: "code", header: "Code", render: (r) => <span className="font-mono-jb text-xs">{r.code}</span> },
    { key: "name", header: "Project", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "client", header: "Client" },
    { key: "manager", header: "PM", className: "text-muted-foreground" },
    { key: "budget", header: "Budget", className: "text-right", render: (r) => <span className="font-mono-jb text-xs">₹{Number(r.budget || 0).toLocaleString("en-IN")}</span> },
    { key: "progress", header: "Progress", render: (r) => (
      <div className="max-w-[160px]">
        <Progress value={r.progress || 0} className="h-2" />
        <div className="text-[11px] text-muted-foreground mt-1 font-mono-jb">{r.progress || 0}%</div>
      </div>
    ) },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <>
      <DataTable
        title="Projects"
        description="Agency projects with status, budget and progress."
        data={rows} loading={loading} columns={columns}
        onAdd={() => { setForm(empty); setEditingId(null); setOpen(true); }}
        addLabel="New project" addTestId="add-project-btn"
        searchKeys={["code", "name", "client", "manager"]}
        rowActions={(row) => (
          <div className="flex justify-end gap-1">
            <Button size="icon" variant="ghost" onClick={() => { setForm({ ...empty, ...row }); setEditingId(row.id); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => remove(row.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        )}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? "Edit project" : "New project"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Client</Label><Input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} /></div>
            <div><Label>Manager</Label><Input value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} /></div>
            <div><Label>Budget</Label><Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></div>
            <div><Label>Progress %</Label><Input type="number" min={0} max={100} value={form.progress} onChange={(e) => setForm({ ...form, progress: e.target.value })} /></div>
            <div className="col-span-2"><Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
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
