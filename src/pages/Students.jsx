
import { useEffect, useState } from "react";
import api from "@/lib/api";
import DataTable, { StatusBadge } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

const empty = { student_id: "", name: "", email: "", phone: "", course_code: "", batch: "", status: "active", fees_paid: 0, fees_total: 0 };

export default function Students() {
  const [rows, setRows] = useState([]);
  const [courses, setCourses] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try { 
      // 1. மாணவர்களின் விவரங்களை ஏற்றுதல்
      const resStudents = await api.get("/students");
      const rawData = resStudents.data;
      let finalRows = [];

      if (Array.isArray(rawData)) {
        finalRows = rawData;
      } else if (rawData && typeof rawData === "object") {
        finalRows = rawData.data || rawData.students || Object.values(rawData).find(Array.isArray) || [];
      }
      setRows(finalRows);

      // 2. Database-லிருந்து கோர்ஸ்களை ஏற்றுதல் (Fees உடன் சேர்த்து)
      try {
        const resCourses = await api.get("/courses");
        const courseData = resCourses.data;
        let fetchedCourses = [];
        
        if (Array.isArray(courseData)) {
          fetchedCourses = courseData;
        } else if (courseData && typeof courseData === "object") {
          fetchedCourses = courseData.data || courseData.courses || Object.values(courseData).find(Array.isArray) || [];
        }
        
        // கோர்ஸின் பெயர் மற்றும் கட்டணத்தை (fee) சேர்த்து ஃபார்மட் செய்தல்
        const formattedFetched = fetchedCourses.map(c => {
          const courseName = c.name || c.title || c.code || "";
          const courseFee = Number(c.fee || c.fees || c.price || c.fees_total || 0);
          return {
            name: courseName,
            fee: courseFee
          };
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

  // --- Auto-generate Student ID (TS-STU-00001 format) ---
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
      fees_total: defaultFee 
    });
    setEditingId(null);
    setOpen(true);
  };

  const openEdit = (r) => { 
    setForm({ ...empty, ...r }); 
    setEditingId(r.id); 
    setOpen(true); 
  };

  // கோர்ஸ் மாறும்போது ஆட்டோமேட்டிக்காக Total Fees மாற்றும் வசதி
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
    // புதியதாக மாணவர் சேர்க்கப்படும்போது தற்போதைய தேதி மற்றும் நேரத்தை (Created Date & Time) சேர்த்தல்
    const payload = { 
      ...form, 
      fees_paid: Number(form.fees_paid) || 0, 
      fees_total: Number(form.fees_total) || 0,
      created_at: editingId ? form.created_at : new Date().toISOString() 
    };

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
    // --- S.No சரியான முறையில் index மூலம் கொடுக்கப்பட்டுள்ளது ---
   { 
      key: "s_no", 
      header: "S.No", 
      render: (r) => <span className="text-muted-foreground text-xs">{rows.indexOf(r) + 1}</span> 
    },
    { key: "student_id", header: "ID", render: (r) => <span className="font-mono-jb text-xs">{r.student_id}</span> },
    { key: "name", header: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "email", header: "Email", className: "text-muted-foreground" },
    { key: "course_code", header: "Course" },
    { key: "batch", header: "Batch", className: "text-muted-foreground" },
    { 
      key: "fees", 
      header: "Fees", 
      className: "text-right", 
      render: (r) => (
        <div className="text-right font-mono-jb text-xs">
          ₹{(r.fees_paid || 0).toLocaleString("en-IN")} / ₹{(r.fees_total || 0).toLocaleString("en-IN")}
        </div>
      ) 
    },
    // --- Joined Date & Time நெடுவரிசை சேர்க்கப்பட்டுள்ளது ---
    { 
      key: "created_at", 
      header: "Joined Date", 
      render: (r) => (
        <span className="text-muted-foreground text-xs">
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

      {/* Responsive Dialog Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit student" : "Add student"}</DialogTitle>
            <DialogDescription>
              Fill in the student details below and click save.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="col-span-1">
              <Label>Student ID</Label>
              <Input 
                data-testid="student-id-input" 
                value={form.student_id} 
                readOnly={!editingId} 
                className={!editingId ? "bg-muted cursor-not-allowed font-mono-jb" : "font-mono-jb"}
                onChange={(e) => setForm({ ...form, student_id: e.target.value })} 
              />
            </div>
            
            <div className="col-span-1">
              <Label>Name</Label>
              <Input data-testid="student-name-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <Label>Email</Label>
              <Input data-testid="student-email-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>

            <div className="col-span-1">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            
            <div className="col-span-1">
              <Label>Course</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 truncate"
                value={form.course_code}
                onChange={(e) => handleCourseChange(e.target.value)}
              >
                <option value="">Select Course</option>
                {courses.length > 0 ? (
                  courses.map((c, index) => (
                    <option key={index} value={c.name}>
                      {c.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No courses found in database</option>
                )}
              </select>
            </div>

            <div className="col-span-1">
              <Label>Batch</Label>
              <Input value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} />
            </div>

            <div className="col-span-1">
              <Label>Status</Label>
              <Input value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
            </div>

            <div className="col-span-1">
              <Label>Fees Paid</Label>
              <Input type="number" value={form.fees_paid} onChange={(e) => setForm({ ...form, fees_paid: e.target.value })} />
            </div>

            <div className="col-span-1">
              <Label>Fees Total</Label>
              <Input type="number" value={form.fees_total} onChange={(e) => setForm({ ...form, fees_total: e.target.value })} />
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
            <Button variant="ghost" onClick={() => setOpen(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button className="btn-gradient w-full sm:w-auto" data-testid="student-save-btn" onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}