import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import DataTable, { StatusBadge } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Trash2, Pencil, History } from "lucide-react";
import { toast } from "sonner";

const empty = { student_id: "", name: "", email: "", phone: "", course_code: "", batch: "", status: "active", fees_paid: 0, fees_total: 0, edit_history: [] };

export default function Students() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [courses, setCourses] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState([]);
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try { 
      const resStudents = await api.get("/students");
      const rawData = resStudents.data;
      let finalRows = [];

      if (Array.isArray(rawData)) {
        finalRows = rawData;
      } else if (rawData && typeof rawData === "object") {
        finalRows = rawData.data || rawData.students || Object.values(rawData).find(Array.isArray) || [];
      }
      setRows(finalRows);

      try {
        const resCourses = await api.get("/courses");
        const courseData = resCourses.data;
        let fetchedCourses = [];
        
        if (Array.isArray(courseData)) {
          fetchedCourses = courseData;
        } else if (courseData && typeof courseData === "object") {
          fetchedCourses = courseData.data || courseData.courses || Object.values(courseData).find(Array.isArray) || [];
        }
        
        const formattedFetched = fetchedCourses.map(c => {
          const courseName = c.name || c.title || c.code || "";
          const courseFee = Number(c.fee || c.fees || c.price || c.fees_total || 0);
          return { name: courseName, fee: courseFee };
        });
        
        setCourses(formattedFetched);
      } catch (err) {
        console.error("Failed to load courses from database:", err);
        setCourses([]);
      }

    } catch (err) {
      console.error("Failed to load students:", err);
      toast.error("Failed to load students");
      setRows([]);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { load(); }, []);

  const generateStudentId = (existingRows) => {
    if (!existingRows || existingRows.length === 0) {
      return "TS-STU-00001";
    }

    let maxNum = 0;
    existingRows.forEach((row) => {
      if (row.student_id && row.student_id.startsWith("TS-STU-")) {
        const numStr = row.student_id.replace("TS-STU-", "");
        const num = parseInt(numStr, 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });

    const nextNum = maxNum + 1;
    return `TS-STU-${String(nextNum).padStart(5, "0")}`;
  };

  const openAdd = () => {
    const nextId = generateStudentId(rows);
    const defaultCourse = courses.length > 0 ? courses[0].name : "";
    const defaultFee = courses.length > 0 ? courses[0].fee : 0;
    
    setForm({ 
      ...empty, 
      student_id: nextId, 
      course_code: defaultCourse, 
      fees_total: defaultFee,
      edit_history: []
    });
    setEditingId(null);
    setOpen(true);
  };

  const openEdit = (r) => { 
    setForm({ ...empty, ...r }); 
    setEditingId(r.id); 
    setOpen(true); 
  };

  const openHistoryModal = (r) => {
    setSelectedStudentName(r.name || r.student_id);
    setSelectedHistory(r.edit_history || []);
    setHistoryOpen(true);
  };

  const handleCourseChange = (selectedCourseName) => {
    const foundCourse = courses.find(c => c.name === selectedCourseName);
    const newFee = foundCourse ? foundCourse.fee : 0;
    
    setForm({
      ...form,
      course_code: selectedCourseName,
      fees_total: newFee
    });
  };

  const save = async () => {
    const currentUserName = user?.name || user?.email || "System User";
    const currentTime = new Date().toISOString();

    let changesSummary = "Created new record";
    let existingHistory = form.edit_history || [];

    if (editingId) {
      // Find old record to check what changed
      const oldRecord = rows.find(r => r.id === editingId);
      const diffs = [];
      if (oldRecord) {
        if (oldRecord.name !== form.name) diffs.push(`Name: '${oldRecord.name}' -> '${form.name}'`);
        if (oldRecord.email !== form.email) diffs.push(`Email: '${oldRecord.email}' -> '${form.email}'`);
        if (oldRecord.phone !== form.phone) diffs.push(`Phone: '${oldRecord.phone}' -> '${form.phone}'`);
        if (oldRecord.course_code !== form.course_code) diffs.push(`Course: '${oldRecord.course_code}' -> '${form.course_code}'`);
        if (oldRecord.batch !== form.batch) diffs.push(`Batch: '${oldRecord.batch}' -> '${form.batch}'`);
        if (oldRecord.status !== form.status) diffs.push(`Status: '${oldRecord.status}' -> '${form.status}'`);
        if (Number(oldRecord.fees_paid) !== Number(form.fees_paid)) diffs.push(`Fees Paid: ₹${oldRecord.fees_paid} -> ₹${form.fees_paid}`);
        if (Number(oldRecord.fees_total) !== Number(form.fees_total)) diffs.push(`Fees Total: ₹${oldRecord.fees_total} -> ₹${form.fees_total}`);
      }
      changesSummary = diffs.length > 0 ? diffs.join(", ") : "Updated record details";
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
      fees_paid: Number(form.fees_paid) || 0, 
      fees_total: Number(form.fees_total) || 0,
      created_at: editingId ? form.created_at : currentTime,
      created_by: editingId ? (form.created_by || currentUserName) : currentUserName,
      updated_by: currentUserName,
      updated_at: currentTime,
      edit_history: updatedHistory
    };

    try {
      if (editingId) await api.put(`/students/${editingId}`, payload);
      else await api.post("/students", payload);
      toast.success(editingId ? "Student updated successfully" : "Student added successfully");
      setOpen(false);
      load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed to save student"); }
  };

  const remove = async (id) => {
    if (!confirm("Delete this student?")) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success("Deleted successfully");
      load();
    } catch (e) {
      toast.error("Failed to delete student");
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
      key: "student_id", 
      header: "ID", 
      render: (r) => <span className="font-mono text-xs whitespace-nowrap">{r.student_id}</span> 
    },
    { 
      key: "name", 
      header: "Student & Contact", 
      render: (r) => (
        <div className="space-y-0.5 py-1">
          <div className="font-medium text-foreground">{r.name}</div>
          <div className="text-xs text-muted-foreground">{r.email}</div>
          {r.phone && <div className="text-xs text-muted-foreground sm:hidden">{r.phone}</div>}
        </div>
      ) 
    },
    { 
      key: "course_batch", 
      header: "Course & Batch", 
      className: "hidden md:table-cell",
      render: (r) => (
        <div className="space-y-0.5">
          <div className="font-medium">{r.course_code || "-"}</div>
          <div className="text-xs text-muted-foreground">{r.batch || "No Batch"}</div>
        </div>
      ) 
    },
    { 
      key: "fees", 
      header: "Fees Status", 
      className: "text-right", 
      render: (r) => (
        <div className="text-right font-mono text-xs whitespace-nowrap">
          <div className="font-medium text-foreground">₹{(r.fees_paid || 0).toLocaleString("en-IN")}</div>
          <div className="text-muted-foreground text-[11px]">of ₹{(r.fees_total || 0).toLocaleString("en-IN")}</div>
        </div>
      ) 
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
      key: "created_at", 
      header: "Joined Date", 
      className: "hidden xl:table-cell",
      render: (r) => (
        <span className="text-muted-foreground text-xs whitespace-nowrap">
          {r.created_at ? new Date(r.created_at).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          }) : "-"}
        </span>
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
        title="Students Management"
        description="All enrolled student records with real-time tracking, edit history logs, fees, and system auditing."
        data={rows}
        loading={loading}
        columns={columns}
        onAdd={openAdd}
        addLabel="Add student"
        addTestId="add-student-btn"
        searchKeys={["student_id", "name", "email", "course_code", "batch", "created_by", "updated_by"]}
        rowActions={(row) => (
          <div className="flex items-center justify-end gap-1">
            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="View Edit History" onClick={() => openHistoryModal(row)}>
              <History className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" data-testid={`edit-student-${row.id}`} onClick={() => openEdit(row)}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" data-testid={`delete-student-${row.id}`} onClick={() => remove(row.id)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        )}
      />

      {/* Add / Edit Student Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-semibold">{editingId ? "Edit Student Record" : "Add New Student"}</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {editingId ? `Editing record as ${user?.name || "Admin"}` : `Adding new record as ${user?.name || "Admin"}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 py-2">
            <div className="col-span-1">
              <Label className="text-xs sm:text-sm font-medium">Student ID</Label>
              <Input 
                data-testid="student-id-input" 
                value={form.student_id} 
                readOnly={!editingId} 
                className={!editingId ? "bg-muted cursor-not-allowed font-mono text-xs sm:text-sm mt-1" : "font-mono text-xs sm:text-sm mt-1"}
                onChange={(e) => setForm({ ...form, student_id: e.target.value })} 
              />
            </div>
            
            <div className="col-span-1">
              <Label className="text-xs sm:text-sm font-medium">Full Name</Label>
              <Input className="text-xs sm:text-sm mt-1" data-testid="student-name-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <Label className="text-xs sm:text-sm font-medium">Email Address</Label>
              <Input className="text-xs sm:text-sm mt-1" data-testid="student-email-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="student@example.com" />
            </div>

            <div className="col-span-1">
              <Label className="text-xs sm:text-sm font-medium">Phone Number</Label>
              <Input className="text-xs sm:text-sm mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 9876543210" />
            </div>
            
            <div className="col-span-1">
              <Label className="text-xs sm:text-sm font-medium">Course</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 truncate mt-1"
                value={form.course_code}
                onChange={(e) => handleCourseChange(e.target.value)}
              >
                <option value="">Select Course</option>
                {courses.length > 0 ? (
                  courses.map((c, index) => (
                    <option key={index} value={c.name}>{c.name}</option>
                  ))
                ) : (
                  <option value="" disabled>No courses found</option>
                )}
              </select>
            </div>

            <div className="col-span-1">
              <Label className="text-xs sm:text-sm font-medium">Batch</Label>
              <Input className="text-xs sm:text-sm mt-1" value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} placeholder="Morning 2026" />
            </div>

            <div className="col-span-1">
              <Label className="text-xs sm:text-sm font-medium">Status</Label>
              <Input className="text-xs sm:text-sm mt-1" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} placeholder="active" />
            </div>

            <div className="col-span-1">
              <Label className="text-xs sm:text-sm font-medium">Fees Paid (₹)</Label>
              <Input className="text-xs sm:text-sm mt-1" type="number" value={form.fees_paid} onChange={(e) => setForm({ ...form, fees_paid: e.target.value })} />
            </div>

            <div className="col-span-1">
              <Label className="text-xs sm:text-sm font-medium">Fees Total (₹)</Label>
              <Input className="text-xs sm:text-sm mt-1" type="number" value={form.fees_total} onChange={(e) => setForm({ ...form, fees_total: e.target.value })} />
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button className="w-full sm:w-auto" data-testid="student-save-btn" onClick={save}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit History Log Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Edit History Logs</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Activity timeline for <span className="font-semibold text-foreground">{selectedStudentName}</span>
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
                    <span className="font-medium text-foreground">Changes:</span> {log.changes || "Updated record details"}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground text-xs sm:text-sm">
                No history logs available for this student.
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