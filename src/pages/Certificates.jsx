import { useEffect, useRef, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DataTable, { StatusBadge } from "@/components/DataTable";
import CertificateTemplate from "@/components/CertificateTemplate";
import { Award, Download, Eye, Trash2, Printer } from "lucide-react";
import { toast } from "sonner";

export default function Certificates() {
  const [rows, setRows] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [issueOpen, setIssueOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [exporting, setExporting] = useState(false);
  const certRef = useRef(null);

  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    student_id: "",
    course_code: "",
    course_title: "",
    program_type: "Internship Training",
    start_date: today,
    end_date: today,
    issued_by_name: "Sasikumar",
    issued_by_title: "Founder & CEO",
    manager_name: "Ramesh Kumar",
    manager_title: "Training Manager",
  });

  const load = async () => {
    setLoading(true);
    try {
      const [c, s, co] = await Promise.all([
        api.get("/certificates"),
        api.get("/students"),
        api.get("/courses"),
      ]);
      setRows(c.data);
      setStudents(s.data);
      setCourses(co.data);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openIssue = () => {
    const s0 = students[0];
    const c0 = courses[0];
    setForm({
      ...form,
      student_id: s0?.student_id || "",
      course_code: c0?.code || "",
      course_title: c0?.title || "Course Completion",
    });
    setIssueOpen(true);
  };

  const onCourseChange = (code) => {
    const c = courses.find((x) => x.code === code);
    setForm({ ...form, course_code: code, course_title: c?.title || "" });
  };

  const issue = async () => {
    try {
      const { data } = await api.post("/certificates/issue", form);
      toast.success(`Certificate ${data.certificate_id} issued`);
      setIssueOpen(false);
      await load();
      openPreview(data);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed");
    }
  };

  const openPreview = (row) => {
    setPreviewData(row);
    setPreviewOpen(true);
  };

  const revoke = async (id) => {
    if (!confirm("Revoke this certificate? This action cannot be undone.")) return;
    await api.delete(`/certificates/${id}`);
    toast.success("Certificate revoked");
    load();
  };

  const downloadPDF = async () => {
    if (!certRef.current || !previewData) return;
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight, undefined, "FAST");
      pdf.save(`TechSasi-Certificate-${previewData.certificate_id.replace(/\//g, "-")}.pdf`);
      toast.success("PDF downloaded");
    } catch (e) {
      toast.error("Failed to generate PDF: " + e.message);
    } finally {
      setExporting(false);
    }
  };

  const printCert = () => window.print();

  const verifyUrl = previewData
    ? `${window.location.origin}/verify/${previewData.verify_token}`
    : "";

  const columns = [
    { key: "certificate_id", header: "Certificate ID", render: (r) => <span className="font-mono-jb text-xs">{r.certificate_id}</span> },
    { key: "student_name", header: "Student", render: (r) => <span className="font-medium">{r.student_name}</span> },
    { key: "course_title", header: "Program", render: (r) => (
      <div>
        <div>{r.course_title}</div>
        <div className="text-[11px] text-muted-foreground">{r.program_type}</div>
      </div>
    )},
    { key: "issue_date", header: "Issued" },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <>
      <DataTable
        title="Certificates"
        description="Issue signed PDF certificates that students can share, print, or verify online via QR."
        data={rows} loading={loading} columns={columns}
        onAdd={openIssue}
        addLabel="Issue certificate" addTestId="issue-cert-btn"
        searchKeys={["certificate_id", "student_name", "course_title"]}
        rowActions={(row) => (
          <div className="flex justify-end gap-1">
            <Button size="icon" variant="ghost" data-testid={`preview-cert-${row.id}`} onClick={() => openPreview(row)}><Eye className="w-4 h-4" /></Button>
            {row.status !== "revoked" && (
              <Button size="icon" variant="ghost" onClick={() => revoke(row.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            )}
          </div>
        )}
      />

      {/* Issue dialog */}
      <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Award className="w-5 h-5 text-primary" /> Issue certificate</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Student</Label>
              <Select value={form.student_id} onValueChange={(v) => setForm({ ...form, student_id: v })}>
                <SelectTrigger data-testid="cert-student-select"><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.student_id} value={s.student_id}>
                      {s.name} — {s.student_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Course</Label>
              <Select value={form.course_code} onValueChange={onCourseChange}>
                <SelectTrigger data-testid="cert-course-select"><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.code} value={c.code}>{c.code} — {c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Program type</Label>
              <Select value={form.program_type} onValueChange={(v) => setForm({ ...form, program_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Internship Training">Internship Training</SelectItem>
                  <SelectItem value="Course Completion">Course Completion</SelectItem>
                  <SelectItem value="Workshop Attendance">Workshop Attendance</SelectItem>
                  <SelectItem value="Bootcamp Program">Bootcamp Program</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Start date</Label>
              <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div>
              <Label>End date</Label>
              <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </div>
            <div>
              <Label>Signatory (Founder)</Label>
              <Input value={form.issued_by_name} onChange={(e) => setForm({ ...form, issued_by_name: e.target.value })} />
            </div>
            <div>
              <Label>Signatory title</Label>
              <Input value={form.issued_by_title} onChange={(e) => setForm({ ...form, issued_by_title: e.target.value })} />
            </div>
            <div>
              <Label>Training Manager</Label>
              <Input value={form.manager_name} onChange={(e) => setForm({ ...form, manager_name: e.target.value })} />
            </div>
            <div>
              <Label>Manager title</Label>
              <Input value={form.manager_title} onChange={(e) => setForm({ ...form, manager_title: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIssueOpen(false)}>Cancel</Button>
            <Button data-testid="cert-issue-save" className="btn-gradient" onClick={issue} disabled={!form.student_id || !form.course_code}>
              <Award className="w-4 h-4 mr-1" /> Issue certificate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 flex-row items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" /> Certificate Preview
            </DialogTitle>
            <div className="flex items-center gap-2 pr-8">
              <Button variant="outline" onClick={printCert} data-testid="cert-print-btn"><Printer className="w-4 h-4 mr-1" /> Print</Button>
              <Button className="btn-gradient" onClick={downloadPDF} disabled={exporting} data-testid="cert-download-btn">
                <Download className="w-4 h-4 mr-1" /> {exporting ? "Preparing…" : "Download PDF"}
              </Button>
            </div>
          </DialogHeader>
          <div className="p-6 pt-2 bg-muted/30 max-h-[80vh] overflow-auto flex justify-center">
            <div style={{ transformOrigin: "top center", transform: "scale(0.72)", marginBottom: -300 }}>
              <CertificateTemplate ref={certRef} data={previewData} verifyUrl={verifyUrl} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
