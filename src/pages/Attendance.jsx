import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import DataTable, { StatusBadge } from "@/components/DataTable";
import { CheckCircle2, XCircle, Clock, Calendar as CalIcon, Lock } from "lucide-react";
import { toast } from "sonner";

export default function Attendance() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  // முந்தைய தேதிகளை (Past dates) எடிட் செய்யக் கூடாது என்பதற்கான கண்டிஷன்
  const isPastDate = date < today;

  const load = async () => {
    setLoading(true);
    try {
      const [s, a, sm] = await Promise.all([
        api.get("/students"),
        api.get("/attendance", { params: { date } }),
        api.get("/attendance/summary"),
      ]);
      setStudents(s.data); 
      setAttendance(a.data); 
      setSummary(sm.data);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { load(); }, [date]);

  const mark = async (student_id, status) => {
    if (isPastDate) {
      toast.error("You cannot modify attendance for past dates.");
      return;
    }
    await api.post("/attendance/mark", { person_id: student_id, person_type: "student", date, status, method: "manual" });
    toast.success(`Marked ${status}`);
    load();
  };

  const statusFor = (sid) => attendance.find((a) => a.person_id === sid)?.status;

  const columns = [
    { 
      key: "s_no", 
      header: "S.No", 
      render: (r) => <span className="text-muted-foreground text-xs">{students.indexOf(r) + 1}</span> 
    },
    { key: "student_id", header: "ID", render: (r) => <span className="font-mono-jb text-xs">{r.student_id}</span> },
    { key: "name", header: "Student", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "batch", header: "Batch", className: "text-muted-foreground" },
    { key: "status", header: "Status", render: (r) => statusFor(r.student_id) ? <StatusBadge value={statusFor(r.student_id)} /> : <span className="text-xs text-muted-foreground">Not marked</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Attendance rate", value: `${summary.attendance_rate || 0}%`, icon: CheckCircle2, tone: "success" },
          { label: "Present (all-time)", value: summary.present || 0, icon: CheckCircle2, tone: "success" },
          { label: "Absent", value: summary.absent || 0, icon: XCircle, tone: "danger" },
          { label: "Late", value: summary.late || 0, icon: Clock, tone: "muted" },
        ].map((k) => (
          <div key={k.label} className="kpi-card">
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{k.label}</div>
            <div className="mt-2 flex items-center justify-between">
              <div className="font-outfit text-2xl font-semibold">{k.value}</div>
              <k.icon className={`w-4 h-4 ${k.tone === "success" ? "text-[hsl(var(--success))]" : k.tone === "danger" ? "text-destructive" : "text-muted-foreground"}`} />
            </div>
          </div>
        ))}
      </div>

      <DataTable
        title="Attendance"
        description={isPastDate ? "Viewing past attendance (Locked for editing)." : "Mark attendance for the selected date."}
        data={students}
        loading={loading}
        columns={columns}
        addTestId="att"
        searchKeys={["student_id", "name", "batch"]}
        toolbar={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/70">
            <CalIcon className="w-4 h-4 text-muted-foreground" />
            <input
              type="date"
              data-testid="attendance-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-sm outline-none"
            />
          </div>
        }
        rowActions={(row) => (
          <div className="flex justify-end gap-1">
            {isPastDate ? (
              <span className="flex items-center gap-1 text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                <Lock className="w-3 h-3" /> Locked
              </span>
            ) : (
              <>
                <Button size="sm" variant="ghost" className="text-[hsl(var(--success))]" data-testid={`mark-present-${row.student_id}`} onClick={() => mark(row.student_id, "present")}>Present</Button>
                <Button size="sm" variant="ghost" className="text-yellow-600" data-testid={`mark-late-${row.student_id}`} onClick={() => mark(row.student_id, "late")}>Late</Button>
                <Button size="sm" variant="ghost" className="text-destructive" data-testid={`mark-absent-${row.student_id}`} onClick={() => mark(row.student_id, "absent")}>Absent</Button>
              </>
            )}
          </div>
        )}
      />
    </div>
  );
}