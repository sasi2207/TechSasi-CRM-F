import { useEffect, useState } from "react";
import api from "@/lib/api";
import DataTable, { StatusBadge } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

const empty = { staff_id: "", name: "", email: "", phone: "", role: "staff", department: "", salary: 0, status: "active" };

export default function Staff() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  const load = async () => { setLoading(true); try { const { data } = await api.get("/staff"); setRows(data); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditingId(null); setOpen(true); };
  const openEdit = (r) => { setForm({ ...empty, ...r }); setEditingId(r.id); setOpen(true); };

  const save = async () => {
    const payload = { ...form, salary: Number(form.salary) || 0 };
    try {
      if (editingId) await api.put(`/staff/${editingId}`, payload); else await api.post("/staff", payload);
      toast.success(editingId ? "Staff updated" : "Staff added");
      setOpen(false); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };
  const remove = async (id) => { if (!confirm("Delete this staff member?")) return; await api.delete(`/staff/${id}`); toast.success("Deleted"); load(); };

  const columns = [
    { key: "staff_id", header: "Emp ID", render: (r) => <span className="font-mono-jb text-xs">{r.staff_id}</span> },
    { key: "name", header: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "email", header: "Email", className: "text-muted-foreground" },
    { key: "department", header: "Department" },
    { key: "role", header: "Role", render: (r) => <span className="capitalize">{r.role}</span> },
    { key: "salary", header: "Salary", className: "text-right", render: (r) => <span className="font-mono-jb text-xs">₹{(r.salary || 0).toLocaleString("en-IN")}</span> },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <>
      <DataTable
        title="Staff & HRMS"
        description="Manage employees, trainers, HR and agency team members."
        data={rows} loading={loading} columns={columns}
        onAdd={openAdd} addLabel="Add employee" addTestId="add-staff-btn"
        searchKeys={["staff_id", "name", "email", "department"]}
        rowActions={(row) => (
          <div className="flex justify-end gap-1">
            <Button size="icon" variant="ghost" onClick={() => openEdit(row)}><Pencil className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => remove(row.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        )}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? "Edit employee" : "Add employee"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Emp ID</Label><Input value={form.staff_id} onChange={(e) => setForm({ ...form, staff_id: e.target.value })} /></div>
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="col-span-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>Department</Label><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
            <div><Label>Role</Label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
            <div><Label>Salary</Label><Input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} /></div>
            <div><Label>Status</Label><Input value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} /></div>
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
