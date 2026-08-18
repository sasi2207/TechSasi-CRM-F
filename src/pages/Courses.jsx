import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import DataTable, { StatusBadge } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Trash2, Pencil, History } from "lucide-react";
import { toast } from "sonner";

const empty = { code: "", title: "", duration_weeks: 12, fee: 0, trainer: "", seats: 30, enrolled: 0, status: "active", description: "", edit_history: [] };

export default function Courses() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState([]);
  const [selectedCourseTitle, setSelectedCourseTitle] = useState("");
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  const load = async () => { 
    setLoading(true); 
    try { 
      const { data } = await api.get("/courses"); 
      let finalRows = [];
      if (Array.isArray(data)) {
        finalRows = data;
      } else if (data && typeof data === "object") {
        finalRows = data.data || data.courses || Object.values(data).find(Array.isArray) || [];
      }
      setRows(finalRows); 
    } catch (err) {
      console.error("Failed to load courses:", err);
      toast.error("Failed to load courses");
      setRows([]);
    } finally { 
      setLoading(false); 
    } 
  };
  
  useEffect(() => { load(); }, []);

  const openHistoryModal = (r) => {
    setSelectedCourseTitle(r.title || r.code);
    setSelectedHistory(r.edit_history || []);
    setHistoryOpen(true);
  };

  const save = async () => {
    const currentUserName = user?.name || user?.email || "System User";
    const currentTime = new Date().toISOString();

    let changesSummary = "Created new course record";
    let existingHistory = form.edit_history || [];

    if (editingId) {
      const oldRecord = rows.find(r => r.id === editingId);
      const diffs = [];
      if (oldRecord) {
        if (oldRecord.code !== form.code) diffs.push(`Code: '${oldRecord.code}' -> '${form.code}'`);
        if (oldRecord.title !== form.title) diffs.push(`Title: '${oldRecord.title}' -> '${form.title}'`);
        if (oldRecord.trainer !== form.trainer) diffs.push(`Trainer: '${oldRecord.trainer}' -> '${form.trainer}'`);
        if (Number(oldRecord.duration_weeks) !== Number(form.duration_weeks)) diffs.push(`Duration: ${oldRecord.duration_weeks}w -> ${form.duration_weeks}w`);
        if (Number(oldRecord.fee) !== Number(form.fee)) diffs.push(`Fee: ₹${oldRecord.fee} -> ₹${form.fee}`);
        if (Number(oldRecord.seats) !== Number(form.seats)) diffs.push(`Seats: ${oldRecord.seats} -> ${form.seats}`);
        if (Number(oldRecord.enrolled) !== Number(form.enrolled)) diffs.push(`Enrolled: ${oldRecord.enrolled} -> ${form.enrolled}`);
        if (oldRecord.status !== form.status) diffs.push(`Status: '${oldRecord.status}' -> '${form.status}'`);
      }
      changesSummary = diffs.length > 0 ? diffs.join(", ") : "Updated course details";
    }

    const newHistoryEntry = {
      edited_by: currentUserName,
      edited_at: currentTime,
      action: editingId ? "Update" : "Create",
      changes: changesSummary
    };

    const updatedHistory = [newHistoryEntry, ...existingHistory];

    const payload = { 
      ...form, 
      duration_weeks: Number(form.duration_weeks) || 0, 
      fee: Number(form.fee) || 0, 
      seats: Number(form.seats) || 0, 
      enrolled: Number(form.enrolled) || 0,
      created_at: editingId ? form.created_at : currentTime,
      created_by: editingId ? (form.created_by || currentUserName) : currentUserName,
      updated_by: currentUserName,
      updated_at: currentTime,
      edit_history: updatedHistory
    };

    try {
      if (editingId) await api.put(`/courses/${editingId}`, payload); 
      else await api.post("/courses", payload);
      toast.success(editingId ? "Course updated successfully" : "Course added successfully"); 
      setOpen(false); 
      load();
    } catch (e) { 
      toast.error(e.response?.data?.detail || "Failed to save course"); 
    }
  };

  const remove = async (id) => { 
    if (!confirm("Delete this course?")) return; 
    try {
      await api.delete(`/courses/${id}`); 
      toast.success("Deleted successfully"); 
      load(); 
    } catch (err) {
      toast.error("Failed to delete course");
    }
  };

  const columns = [
    { 
      key: "s_no", 
      header: "S.No", 
      className: "w-12 text-center hidden sm:table-cell",
      render: (r) => <span className="text-muted-foreground text-xs">{rows.indexOf(r) + 1}</span> 
    },
    { 
      key: "code", 
      header: "Code", 
      render: (r) => <span className="font-mono-jb text-xs">{r.code}</span> 
    },
    { 
      key: "title_trainer", 
      header: "Course & Trainer", 
      render: (r) => (
        <div className="space-y-0.5 py-1">
          <div className="font-medium text-foreground">{r.title}</div>
          <div className="text-xs text-muted-foreground">Trainer: {r.trainer || "Not Assigned"}</div>
        </div>
      ) 
    },
    { 
      key: "duration", 
      header: "Duration", 
      className: "hidden md:table-cell",
      render: (r) => `${r.duration_weeks} weeks` 
    },
    { 
      key: "seats", 
      header: "Seats", 
      className: "text-right", 
      render: (r) => <span className="font-mono-jb text-xs">{r.enrolled}/{r.seats}</span> 
    },
    { 
      key: "fee", 
      header: "Fee", 
      className: "text-right", 
      render: (r) => <span className="font-mono-jb text-xs">₹{Number(r.fee || 0).toLocaleString("en-IN")}</span> 
    },
    {
      key: "user_tracking",
      header: "Managed By",
      className: "hidden lg:table-cell",
      render: (r) => (
        <div className="text-xs text-muted-foreground space-y-0.5">
          <div><span className="font-medium text-foreground">Added:</span> {r.created_by || "System"}</div>
          {r.updated_by && r.updated_by !== r.created_by && (
            <div><span className="font-medium text-foreground">Updated:</span> {r.updated_by}</div>
          )}
        </div>
      )
    },
    { 
      key: "status", 
      header: "Status", 
      className: "text-center",
      render: (r) => <StatusBadge value={r.status} /> 
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 space-y-4">
      <DataTable
        title="Courses Management"
        description="Programs offered by the institute with tracking and edit history logs."
        data={rows} 
        loading={loading} 
        columns={columns}
        onAdd={() => { setForm({ ...empty, edit_history: [] }); setEditingId(null); setOpen(true); }}
        addLabel="Add course" 
        addTestId="add-course-btn"
        searchKeys={["code", "title", "trainer", "created_by", "updated_by"]}
        rowActions={(row) => (
          <div className="flex items-center justify-end gap-1">
            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="View Edit History" onClick={() => openHistoryModal(row)}>
              <History className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setForm({ ...empty, ...row }); setEditingId(row.id); setOpen(true); }}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => remove(row.id)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        )}
      />
      
      {/* Add / Edit Course Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-semibold">{editingId ? "Edit Course Record" : "Add New Course"}</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {editingId ? `Editing course as ${user?.name || "Admin"}` : `Adding course as ${user?.name || "Admin"}`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 py-2">
            <div>
              <Label className="text-xs sm:text-sm font-medium">Code</Label>
              <Input className="text-xs sm:text-sm mt-1" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="PY-101" />
            </div>
            <div>
              <Label className="text-xs sm:text-sm font-medium">Title</Label>
              <Input className="text-xs sm:text-sm mt-1" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Python Full Stack" />
            </div>
            <div>
              <Label className="text-xs sm:text-sm font-medium">Trainer</Label>
              <Input className="text-xs sm:text-sm mt-1" value={form.trainer} onChange={(e) => setForm({ ...form, trainer: e.target.value })} placeholder="John Smith" />
            </div>
            <div>
              <Label className="text-xs sm:text-sm font-medium">Duration (weeks)</Label>
              <Input className="text-xs sm:text-sm mt-1" type="number" value={form.duration_weeks} onChange={(e) => setForm({ ...form, duration_weeks: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs sm:text-sm font-medium">Fee (₹)</Label>
              <Input className="text-xs sm:text-sm mt-1" type="number" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs sm:text-sm font-medium">Seats</Label>
              <Input className="text-xs sm:text-sm mt-1" type="number" value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs sm:text-sm font-medium">Enrolled</Label>
              <Input className="text-xs sm:text-sm mt-1" type="number" value={form.enrolled} onChange={(e) => setForm({ ...form, enrolled: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs sm:text-sm font-medium">Status</Label>
              <Input className="text-xs sm:text-sm mt-1" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} placeholder="active" />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <Label className="text-xs sm:text-sm font-medium">Description</Label>
              <Textarea className="text-xs sm:text-sm mt-1" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Course description..." />
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button className="w-full sm:w-auto" onClick={save}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit History Log Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Course Edit History Logs</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Activity timeline for <span className="font-semibold text-foreground">{selectedCourseTitle}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2">
            {selectedHistory && selectedHistory.length > 0 ? (
              selectedHistory.map((log, index) => (
                <div key={index} className="p-3 rounded-lg border bg-muted/30 text-xs sm:text-sm space-y-1">
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-primary font-semibold">{log.edited_by || "System User"}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {log.edited_at ? new Date(log.edited_at).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      }) : "-"}
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    <span className="font-medium text-foreground">Action:</span> {log.action || "Update"}
                  </div>
                  <div className="text-muted-foreground pt-0.5">
                    <span className="font-medium text-foreground">Changes:</span> {log.changes || "Updated course details"}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground text-xs sm:text-sm">
                No history logs available for this course.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryOpen(false)} className="w-full">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}