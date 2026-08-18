import { useEffect, useState } from "react";
import api from "@/lib/api";
import DataTable, { StatusBadge } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

// Get current local datetime-local string format: "YYYY-MM-DDTHH:mm"
const getCurrentLocalDateTime = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - (offset*60*1000));
  return localDate.toISOString().slice(0, 16);
};

const empty = { 
  staff_id: "", 
  name: "", 
  email: "", 
  phone: "", 
  role: "staff", 
  department: "Training", 
  salary: 0, 
  status: "active",
  joined_at: getCurrentLocalDateTime()
};

export default function Staff() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  const load = async () => { setLoading(true); try { const { data } = await api.get("/staff"); setRows(data); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  // Auto-generate employee ID
  const generateEmpId = () => {
    if (rows.length === 0) return "TS-EMY-0001";
    const ids = rows.map(r => parseInt(r.staff_id?.split("-").pop()) || 0);
    const maxId = Math.max(...ids, 0);
    return `TS-EMY-${(maxId + 1).toString().padStart(4, '0')}`;
  };

  const openAdd = () => { 
    setForm({ 
      ...empty, 
      staff_id: generateEmpId(),
      joined_at: getCurrentLocalDateTime()
    }); 
    setEditingId(null); 
    setOpen(true); 
  };
  
  const openEdit = (r) => { 
    // Format existing joined_at date to fit datetime-local input if it exists
    let formattedDate = r.joined_at ? r.joined_at.slice(0, 16) : getCurrentLocalDateTime();
    setForm({ ...empty, ...r, joined_at: formattedDate }); 
    setEditingId(r.id); 
    setOpen(true); 
  };

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
    { 
      key: "joined_at", 
      header: "Joined At", 
      render: (r) => <span className="text-xs text-muted-foreground">{r.joined_at ? new Date(r.joined_at).toLocaleString() : "-"}</span> 
    },
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
            <div><Label>Emp ID</Label><Input value={form.staff_id} disabled={!editingId} /></div>
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="col-span-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            
            {/* Joining Date & Time Field */}
            <div>
              <Label>Joining Date & Time</Label>
              <Input 
                type="datetime-local" 
                value={form.joined_at} 
                onChange={(e) => setForm({ ...form, joined_at: e.target.value })} 
              />
            </div>

            <div>
              <Label>Department</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                <option value="Training">Training</option>
                <option value="HR">HR</option>
                <option value="Agency">Agency</option>
                <option value="Development">Development</option>
                <option value="Management">Management</option>
                <option value="Sales">Sales</option>
              </select>
            </div>

            <div>
              <Label>Role</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="staff">Staff</option>
                <option value="developer">Developer</option>
                <option value="trainer">Trainer</option>
                <option value="hr">HR</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            <div><Label>Salary</Label><Input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} /></div>
            
            <div>
              <Label>Status</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
              </select>
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