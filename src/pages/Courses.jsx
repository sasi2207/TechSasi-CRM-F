import { useEffect, useState } from "react";
import api from "@/lib/api";
import DataTable, { StatusBadge } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

const empty = { code: "", title: "", duration_weeks: 12, fee: 0, trainer: "", seats: 30, enrolled: 0, status: "active", description: "" };

export default function Courses() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  const load = async () => { setLoading(true); try { const { data } = await api.get("/courses"); setRows(data); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const payload = { ...form, duration_weeks: Number(form.duration_weeks), fee: Number(form.fee), seats: Number(form.seats), enrolled: Number(form.enrolled) };
    try {
      if (editingId) await api.put(`/courses/${editingId}`, payload); else await api.post("/courses", payload);
      toast.success("Saved"); setOpen(false); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };
  const remove = async (id) => { if (!confirm("Delete this course?")) return; await api.delete(`/courses/${id}`); toast.success("Deleted"); load(); };

  const columns = [
    { key: "code", header: "Code", render: (r) => <span className="font-mono-jb text-xs">{r.code}</span> },
    { key: "title", header: "Title", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "trainer", header: "Trainer" },
    { key: "duration", header: "Duration", render: (r) => `${r.duration_weeks}w` },
    { key: "seats", header: "Seats", className: "text-right", render: (r) => <span className="font-mono-jb text-xs">{r.enrolled}/{r.seats}</span> },
    { key: "fee", header: "Fee", className: "text-right", render: (r) => <span className="font-mono-jb text-xs">₹{Number(r.fee || 0).toLocaleString("en-IN")}</span> },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <>
      <DataTable
        title="Courses"
        description="Programs offered by the institute."
        data={rows} loading={loading} columns={columns}
        onAdd={() => { setForm(empty); setEditingId(null); setOpen(true); }}
        addLabel="Add course" addTestId="add-course-btn"
        searchKeys={["code", "title", "trainer"]}
        rowActions={(row) => (
          <div className="flex justify-end gap-1">
            <Button size="icon" variant="ghost" onClick={() => { setForm({ ...empty, ...row }); setEditingId(row.id); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => remove(row.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        )}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? "Edit course" : "Add course"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
            <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Trainer</Label><Input value={form.trainer} onChange={(e) => setForm({ ...form, trainer: e.target.value })} /></div>
            <div><Label>Duration (weeks)</Label><Input type="number" value={form.duration_weeks} onChange={(e) => setForm({ ...form, duration_weeks: e.target.value })} /></div>
            <div><Label>Fee</Label><Input type="number" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} /></div>
            <div><Label>Seats</Label><Input type="number" value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} /></div>
            <div><Label>Enrolled</Label><Input type="number" value={form.enrolled} onChange={(e) => setForm({ ...form, enrolled: e.target.value })} /></div>
            <div><Label>Status</Label><Input value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} /></div>
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
