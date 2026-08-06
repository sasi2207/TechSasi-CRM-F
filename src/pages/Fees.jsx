import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import DataTable from "@/components/DataTable";
import { Progress } from "@/components/ui/progress";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";

export default function Fees() {
  const [overview, setOverview] = useState({});
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ student_id: "", amount: 0, method: "cash", note: "" });

  const load = async () => {
    setLoading(true);
    try {
      const [o, s] = await Promise.all([api.get("/fees/overview"), api.get("/fees/students")]);
      setOverview(o.data); setRows(s.data);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const pay = async () => {
    try {
      await api.post("/fees/pay", { ...form, amount: Number(form.amount) });
      toast.success("Payment recorded");
      setOpen(false); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  const columns = [
    { key: "student_id", header: "ID", render: (r) => <span className="font-mono-jb text-xs">{r.student_id}</span> },
    { key: "name", header: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "course_code", header: "Course" },
    { key: "progress", header: "Progress", render: (r) => (
      <div className="max-w-[180px]">
        <Progress value={r.fees_total ? (r.fees_paid / r.fees_total) * 100 : 0} className="h-2" />
        <div className="text-[11px] text-muted-foreground mt-1 font-mono-jb">
          ₹{(r.fees_paid || 0).toLocaleString("en-IN")} / ₹{(r.fees_total || 0).toLocaleString("en-IN")}
        </div>
      </div>
    ) },
    { key: "balance", header: "Balance", className: "text-right", render: (r) => (
      <span className={`font-mono-jb text-xs ${(r.fees_total - r.fees_paid) > 0 ? "text-destructive" : "text-[hsl(var(--success))]"}`}>
        ₹{Math.max(0, (r.fees_total || 0) - (r.fees_paid || 0)).toLocaleString("en-IN")}
      </span>
    ) },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="kpi-card"><div className="text-[11px] uppercase tracking-widest text-muted-foreground">Collected</div><div className="mt-2 font-outfit text-2xl font-semibold">₹{(overview.paid || 0).toLocaleString("en-IN")}</div></div>
        <div className="kpi-card"><div className="text-[11px] uppercase tracking-widest text-muted-foreground">Pending</div><div className="mt-2 font-outfit text-2xl font-semibold text-destructive">₹{(overview.pending || 0).toLocaleString("en-IN")}</div></div>
        <div className="kpi-card"><div className="text-[11px] uppercase tracking-widest text-muted-foreground">Total billable</div><div className="mt-2 font-outfit text-2xl font-semibold">₹{(overview.total || 0).toLocaleString("en-IN")}</div></div>
        <div className="kpi-card"><div className="text-[11px] uppercase tracking-widest text-muted-foreground">Collection rate</div><div className="mt-2 font-outfit text-2xl font-semibold text-[hsl(var(--success))]">{overview.collection_rate || 0}%</div></div>
      </div>

      <DataTable
        title="Fees Collection"
        description="Track and record fee payments per student."
        data={rows} loading={loading} columns={columns}
        onAdd={() => { setForm({ student_id: rows[0]?.student_id || "", amount: 0, method: "cash", note: "" }); setOpen(true); }}
        addLabel="Record payment" addTestId="record-payment-btn"
        searchKeys={["student_id", "name", "course_code"]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Record fee payment</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Student ID</Label><Input value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} /></div>
            <div><Label>Amount (₹)</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
            <div><Label>Method</Label><Input value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} placeholder="cash / upi / card" /></div>
            <div><Label>Note</Label><Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button data-testid="pay-save-btn" className="btn-gradient" onClick={pay}><CreditCard className="w-4 h-4 mr-1" /> Save payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
