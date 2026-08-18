import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import DataTable from "@/components/DataTable";
import { Progress } from "@/components/ui/progress";
import { CreditCard, Eye, History, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Fees() {
  const { user } = useAuth();
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
  const [editForm, setEditForm] = useState({ id: null, amount: 0, method: "cash", note: "", edit_history: [] });

  const load = async () => {
    setLoading(true);
    try {
      const [o, s] = await Promise.all([api.get("/fees/overview"), api.get("/fees/students")]);
      setOverview(o.data); 
      let finalRows = [];
      if (Array.isArray(s.data)) {
        finalRows = s.data;
      } else if (s.data && typeof s.data === "object") {
        finalRows = s.data.data || s.data.students || Object.values(s.data).find(Array.isArray) || [];
      }
      setRows(finalRows);
    } catch (err) {
      console.error("Failed to load fee records:", err);
      toast.error("Failed to load fee details");
      setRows([]);
    } finally { 
      setLoading(false); 
    }
  };
  
  useEffect(() => { load(); }, []);

  const pay = async () => {
    const currentUserName = user?.name || user?.email || "System User";
    const currentTime = new Date().toISOString();

    const initialHistoryEntry = {
      edited_by: currentUserName,
      edited_at: currentTime,
      action: "Record Payment",
      changes: `Paid ₹${Number(form.amount || 0).toLocaleString("en-IN")} via ${form.method || "cash"}`
    };

    try {
      await api.post("/fees/pay", { 
        ...form, 
        amount: Number(form.amount),
        created_by: currentUserName,
        created_at: currentTime,
        updated_by: currentUserName,
        updated_at: currentTime,
        edit_history: [initialHistoryEntry]
      });
      toast.success("Payment recorded successfully");
      setOpen(false); 
      load();
    } catch (e) { 
      toast.error(e.response?.data?.detail || "Failed to record payment"); 
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
      let historyData = [];
      if (Array.isArray(res.data)) {
        historyData = res.data;
      } else if (res.data && typeof res.data === "object") {
        historyData = res.data.data || res.data.history || Object.values(res.data).find(Array.isArray) || [];
      }
      setSelectedStudentHistory(historyData);
    } catch (e) {
      setSelectedStudentHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleEditClick = (txn) => {
    setEditForm({ 
      id: txn.id, 
      amount: txn.amount, 
      method: txn.method || "cash", 
      note: txn.note || "",
      edit_history: txn.edit_history || []
    });
    setEditOpen(true);
  };

  const updatePayment = async () => {
    const currentUserName = user?.name || user?.email || "System User";
    const currentTime = new Date().toISOString();

    let existingHistory = editForm.edit_history || [];
    let changesSummary = `Updated payment amount to ₹${editForm.amount}, method: ${editForm.method}`;

    const newHistoryEntry = {
      edited_by: currentUserName,
      edited_at: currentTime,
      action: "Update Payment",
      changes: changesSummary
    };

    const updatedHistory = [newHistoryEntry, ...existingHistory];

    try {
      await api.put(`/fees/payments/${editForm.id}`, {
        amount: Number(editForm.amount),
        method: editForm.method,
        note: editForm.note,
        updated_by: currentUserName,
        updated_at: currentTime,
        edit_history: updatedHistory
      });
      toast.success("Payment updated successfully");
      setEditOpen(false);
      load();
      if (selectedStudentId) {
        const res = await api.get(`/fees/history`, { params: { student_id: selectedStudentId } });
        let historyData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setSelectedStudentHistory(historyData);
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
        let historyData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setSelectedStudentHistory(historyData);
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to delete payment");
    }
  };

  const columns = [
    { 
      key: "s_no", 
      header: "S.No", 
      className: "w-12 text-center hidden sm:table-cell",
      render: (r) => <span className="text-muted-foreground text-xs">{rows.indexOf(r) + 1}</span> 
    },
    { key: "student_id", header: "ID", render: (r) => <span className="font-mono-jb text-xs">{r.student_id}</span> },
    { key: "name", header: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "course_code", header: "Course", className: "hidden md:table-cell" },
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
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="kpi-card"><div className="text-[11px] uppercase tracking-widest text-muted-foreground">Collected</div><div className="mt-2 font-outfit text-xl sm:text-2xl font-semibold">₹{(overview.paid || 0).toLocaleString("en-IN")}</div></div>
        <div className="kpi-card"><div className="text-[11px] uppercase tracking-widest text-muted-foreground">Pending</div><div className="mt-2 font-outfit text-xl sm:text-2xl font-semibold text-destructive">₹{(overview.pending || 0).toLocaleString("en-IN")}</div></div>
        <div className="kpi-card"><div className="text-[11px] uppercase tracking-widest text-muted-foreground">Total billable</div><div className="mt-2 font-outfit text-xl sm:text-2xl font-semibold">₹{(overview.total || 0).toLocaleString("en-IN")}</div></div>
        <div className="kpi-card"><div className="text-[11px] uppercase tracking-widest text-muted-foreground">Collection rate</div><div className="mt-2 font-outfit text-xl sm:text-2xl font-semibold text-[hsl(var(--success))]">{overview.collection_rate || 0}%</div></div>
      </div>

      <DataTable
        title="Fees Collection"
        description="Track and record fee payments per student with audit logs."
        data={rows} 
        loading={loading} 
        columns={columns}
        onAdd={() => { setForm({ student_id: rows[0]?.student_id || "", amount: 0, method: "cash", note: "" }); setOpen(true); }}
        addLabel="Record payment" 
        addTestId="record-payment-btn"
        searchKeys={["student_id", "name", "course_code"]}
        rowActions={(row) => (
          <div className="flex justify-end gap-1">
            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="View Payment History & Logs" onClick={() => viewHistory(row)}>
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        )}
      />

      {/* Record Payment Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Record fee payment</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">Recording payment as {user?.name || "Admin"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label className="text-xs sm:text-sm font-medium">Student ID</Label><Input className="text-xs sm:text-sm mt-1" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} /></div>
            <div><Label className="text-xs sm:text-sm font-medium">Amount (₹)</Label><Input className="text-xs sm:text-sm mt-1" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
            <div><Label className="text-xs sm:text-sm font-medium">Method</Label><Input className="text-xs sm:text-sm mt-1" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} placeholder="cash / upi / card" /></div>
            <div><Label className="text-xs sm:text-sm font-medium">Note</Label><Input className="text-xs sm:text-sm mt-1" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button data-testid="pay-save-btn" className="btn-gradient w-full sm:w-auto" onClick={pay}><CreditCard className="w-4 h-4 mr-1" /> Save payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Payment History & Logs Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <History className="w-5 h-5 text-primary" /> Payment History - {selectedStudentName}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">List of all payments made by this student with audit tracking.</DialogDescription>
          </DialogHeader>

          <div className="mt-3 space-y-3">
            {historyLoading ? (
              <p className="text-sm text-center py-4 text-muted-foreground">Loading history...</p>
            ) : selectedStudentHistory.length > 0 ? (
              <div className="space-y-3">
                {selectedStudentHistory.map((txn, index) => (
                  <div key={index} className="p-3 rounded-lg border bg-muted/30 text-xs sm:text-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-primary uppercase">Method: {txn.method || "Cash"}</span>
                        <div className="text-muted-foreground text-xs mt-0.5">{txn.note || "Fee payment"}</div>
                        <div className="text-[11px] text-muted-foreground mt-1">
                          {txn.created_at ? new Date(txn.created_at).toLocaleString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                          }) : ""}
                        </div>
                        {txn.created_by && (
                          <div className="text-[11px] text-muted-foreground">Recorded by: <span className="font-medium text-foreground">{txn.created_by}</span></div>
                        )}
                      </div>
                      <div className="text-right space-y-2">
                        <div className="font-mono-jb font-bold text-success text-sm sm:text-base">
                          +₹{Number(txn.amount || 0).toLocaleString("en-IN")}
                        </div>
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEditClick(txn)}>
                            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deletePayment(txn.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Transaction Edit History Timeline inside History Modal */}
                    {txn.edit_history && txn.edit_history.length > 0 && (
                      <div className="border-t pt-2 mt-2 space-y-1">
                        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Transaction Logs:</div>
                        {txn.edit_history.map((log, lIdx) => (
                          <div key={lIdx} className="text-[11px] text-muted-foreground bg-background/50 p-1.5 rounded border">
                            <span className="font-medium text-foreground">{log.edited_by || "System"}</span> ({log.action}): {log.changes} at {log.edited_at ? new Date(log.edited_at).toLocaleString("en-IN") : ""}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-xs sm:text-sm">
                No payment transactions found for this student.
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setHistoryOpen(false)} className="w-full">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Payment Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Edit fee payment</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">Updating payment as {user?.name || "Admin"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label className="text-xs sm:text-sm font-medium">Amount (₹)</Label><Input className="text-xs sm:text-sm mt-1" type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} /></div>
            <div><Label className="text-xs sm:text-sm font-medium">Method</Label><Input className="text-xs sm:text-sm mt-1" value={editForm.method} onChange={(e) => setEditForm({ ...editForm, method: e.target.value })} placeholder="cash / upi / card" /></div>
            <div><Label className="text-xs sm:text-sm font-medium">Note</Label><Input className="text-xs sm:text-sm mt-1" value={editForm.note} onChange={(e) => setEditForm({ ...editForm, note: e.target.value })} /></div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditOpen(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button className="btn-gradient w-full sm:w-auto" onClick={updatePayment}>Update Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}