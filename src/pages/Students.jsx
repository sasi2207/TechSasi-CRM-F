import { useEffect, useState } from "react";
import api from "@/lib/api";
import DataTable, { StatusBadge } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

const empty = { student_id: "", name: "", email: "", phone: "", course_code: "", batch: "", status: "active", fees_paid: 0, fees_total: 0 };

export default function Students() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try { 
      const response = await api.get("/students");
      
      // Safely extract the array whether response.data is an array, 
      // or wrapped inside an object (e.g., response.data.data or response.data.students)
      const rawData = response.data;
      let finalRows = [];

      if (Array.isArray(rawData)) {
        finalRows = rawData;
      } else if (rawData && typeof rawData === "object") {
        finalRows = rawData.data || rawData.students || Object.values(rawData).find(Array.isArray) || [];
      }

      setRows(finalRows);
    } catch (err) {
      console.error("Failed to load students:", err);
      toast.error("Failed to load students");
      setRows([]);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditingId(null); setOpen(true); };
  const openEdit = (r) => { setForm({ ...empty, ...r }); setEditingId(r.id); setOpen(true); };

  const save = async () => {
    const payload = { ...form, fees_paid: Number(form.fees_paid) || 0, fees_total: Number(form.fees_total) || 0 };
    try {
      if (editingId) await api.put(`/students/${editingId}`, payload);
      else await api.post("/students", payload);
      toast.success(editingId ? "Student updated" : "Student added");
      setOpen(false);
      load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  const remove = async (id) => {
    if (!confirm("Delete this student?")) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error("Failed to delete student");
    }
  };

  const columns = [
    { key: "student_id", header: "ID", render: (r) => <span className="font-mono-jb text-xs">{r.student_id}</span> },
    { key: "name", header: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "email", header: "Email", className: "text-muted-foreground" },
    { key: "course_code", header: "Course" },
    { key: "batch", header: "Batch", className: "text-muted-foreground" },
    { key: "fees", header: "Fees", className: "text-right", render: (r) => (
      <div className="text-right font-mono-jb text-xs">
        ₹{(r.fees_paid || 0).toLocaleString("en-IN")} / ₹{(r.fees_total || 0).toLocaleString("en-IN")}
      </div>
    ) },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <>
      <DataTable
        title="Students"
        description="All enrolled students with real-time fees and status."
        data={rows}
        loading={loading}
        columns={columns}
        onAdd={openAdd}
        addLabel="Add student"
        addTestId="add-student-btn"
        searchKeys={["student_id", "name", "email", "course_code", "batch"]}
        rowActions={(row) => (
          <div className="flex justify-end gap-1">
            <Button size="icon" variant="ghost" data-testid={`edit-student-${row.id}`} onClick={() => openEdit(row)}><Pencil className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" data-testid={`delete-student-${row.id}`} onClick={() => remove(row.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        )}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? "Edit student" : "Add student"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-1"><Label>Student ID</Label><Input data-testid="student-id-input" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} /></div>
            <div className="col-span-1"><Label>Name</Label><Input data-testid="student-name-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="col-span-2"><Label>Email</Label><Input data-testid="student-email-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="col-span-1"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="col-span-1"><Label>Course Code</Label><Input value={form.course_code} onChange={(e) => setForm({ ...form, course_code: e.target.value })} /></div>
            <div className="col-span-1"><Label>Batch</Label><Input value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} /></div>
            <div className="col-span-1"><Label>Status</Label><Input value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} /></div>
            <div className="col-span-1"><Label>Fees Paid</Label><Input type="number" value={form.fees_paid} onChange={(e) => setForm({ ...form, fees_paid: e.target.value })} /></div>
            <div className="col-span-1"><Label>Fees Total</Label><Input type="number" value={form.fees_total} onChange={(e) => setForm({ ...form, fees_total: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="btn-gradient" data-testid="student-save-btn" onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}