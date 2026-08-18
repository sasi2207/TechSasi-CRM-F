import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import DataTable from "@/components/DataTable";
import { Progress } from "@/components/ui/progress";
import { CreditCard, Eye, History, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Fees() {
  const [overview, setOverview] = useState({});
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ student_id: "", amount: 0, method: "cash", note: "" });

  // History states
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedStudentHistory, setSelectedStudentHistory] = useState([]);
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);

  // Edit payment states
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ id: null, amount: 0, method: "cash", note: "" });

  const load = async () => {
    setLoading(true);
    try {
      const [o, s] = await Promise.all([api.get("/fees/overview"), api.get("/fees/students")]);
      setOverview(o.data); 
      setRows(s.data);
    } finally { 
      setLoading(false); 
    }
  };
  
  useEffect(() => { load(); }, []);

  const pay = async () => {
    try {
      await api.post("/fees/pay", { ...form, amount: Number(form.amount) });
      toast.success("Payment recorded");
      setOpen(false); 
      load();
    } catch (e) { 
      toast.error(e.response?.data?.detail || "Failed"); 
    }
  };

  const viewHistory = async (student) => {
    setSelectedStudentName(student.name);
    setSelectedStudentId(student.student_id);
    setSelectedStudentHistory([]);
    setHistoryOpen(true);
    setHistoryLoading(true);

    try {
      const res = await api.get(`/fees/history`, { params: { student_id: student.student_id } });
      setSelectedStudentHistory(res.data || []);
    } catch (e) {
      setSelectedStudentHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleEditClick = (txn) => {
    setEditForm({ id: txn.id, amount: txn.amount, method: txn.method || "cash", note: txn.note || "" });
    setEditOpen(true);
  };

  const updatePayment = async () => {
    try {
      await api.put(`/fees/payments/${editForm.id}`, {
        amount: Number(editForm.amount),
        method: editForm.method,
        note: editForm.note
      });
      toast.success("Payment updated successfully");
      setEditOpen(false);
      load();
      if (selectedStudentId) {
        const res = await api.get(`/fees/history`, { params: { student_id: selectedStudentId } });
        setSelectedStudentHistory(res.data || []);
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to update payment");
    }
  };

  const deletePayment = async (txnId) => {
    if (!confirm("Are you sure you want to delete this payment record?")) return;
    try {
      await api.delete(`/fees/payments/${txnId}`);
      toast.success("Payment deleted successfully");
      load();
      if (selectedStudentId) {
        const res = await api.get(`/fees/history`, { params: { student_id: selectedStudentId } });
        setSelectedStudentHistory(res.data || []);
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to delete payment");
    }
  };

  const columns = [
    { 
      key: "s_no", 
      header: "S.No", 
      render: (r) => <span className="text-muted-foreground text-xs">{rows.indexOf(r) + 1}</span> 
    },
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
        data={rows} 
        loading={loading} 
        columns={columns}
        onAdd={() => { setForm({ student_id: rows[0]?.student_id || "", amount: 0, method: "cash", note: "" }); setOpen(true); }}
        addLabel="Record payment" 
        addTestId="record-payment-btn"
        searchKeys={["student_id", "name", "course_code"]}
        rowActions={(row) => (
          <div className="flex justify-end gap-1">
            <Button size="icon" variant="ghost" title="View Payment History" onClick={() => viewHistory(row)}>
              <Eye className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        )}
      />

      {/* Record Payment Dialog */}
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

      {/* View Payment History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" /> Payment History - {selectedStudentName}
            </DialogTitle>
            <DialogDescription>List of all payments made by this student with edit/delete options.</DialogDescription>
          </DialogHeader>

          <div className="mt-3">
            {historyLoading ? (
              <p className="text-sm text-center py-4 text-muted-foreground">Loading history...</p>
            ) : selectedStudentHistory.length > 0 ? (
              <div className="border rounded-md divide-y">
                {selectedStudentHistory.map((txn, index) => (
                  <div key={index} className="p-3 flex items-center justify-between text-sm">
                    <div>
                      <div className="font-semibold text-xs text-primary uppercase">Method: {txn.method || "Cash"}</div>
                      <div className="text-muted-foreground text-xs mt-0.5">{txn.note || "Fee payment"}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {txn.created_at ? new Date(txn.created_at).toLocaleString("en-IN") : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="font-mono-jb font-bold text-success">
                        +₹{Number(txn.amount || 0).toLocaleString("en-IN")}
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEditClick(txn)}>
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deletePayment(txn.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No payment transactions found for this student.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Payment Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit fee payment</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Amount (₹)</Label><Input type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} /></div>
            <div><Label>Method</Label><Input value={editForm.method} onChange={(e) => setEditForm({ ...editForm, method: e.target.value })} placeholder="cash / upi / card" /></div>
            <div><Label>Note</Label><Input value={editForm.note} onChange={(e) => setEditForm({ ...editForm, note: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button className="btn-gradient" onClick={updatePayment}>Update Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}