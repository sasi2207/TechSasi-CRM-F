import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API } from "@/lib/api";
import { BadgeCheck, XCircle, Loader2, Building2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyCertificate() {
  const { token } = useParams();
  const [state, setState] = useState({ loading: true, data: null });

  useEffect(() => {
    fetch(`${API}/certificates/verify/${token}`)
      .then((r) => r.json())
      .then((d) => setState({ loading: false, data: d }))
      .catch(() => setState({ loading: false, data: { valid: false, message: "Network error" } }));
  }, [token]);

  const { loading, data } = state;

  return (
    <div className="min-h-screen auth-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <Link to="/" className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#FF8C33] flex items-center justify-center shadow-lg shadow-primary/20">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-outfit font-semibold text-lg leading-tight">TechSasi ERP + CRM</div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Certificate Verification</div>
          </div>
        </Link>

        <div className="rounded-2xl bg-card border border-border shadow-xl p-8 text-center">
          {loading && (
            <>
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
              <div className="mt-3 text-sm text-muted-foreground">Verifying certificate…</div>
            </>
          )}
          {!loading && data && data.valid && (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-[hsl(var(--success)/0.15)] flex items-center justify-center">
                <BadgeCheck className="w-8 h-8 text-[hsl(var(--success))]" />
              </div>
              <h1 className="mt-4 font-outfit text-2xl font-semibold">Valid certificate</h1>
              <p className="text-sm text-muted-foreground mt-1">This certificate is authentic and was issued by TechSasi.</p>
              <div className="mt-6 space-y-3 text-left">
                <Row label="Certificate ID" value={data.certificate_id} mono />
                <Row label="Student name" value={data.student_name} />
                <Row label="Program" value={data.course_title} />
                <Row label="Type" value={data.program_type} />
                <Row label="Duration" value={`${data.start_date} → ${data.end_date}`} />
                <Row label="Issued on" value={data.issue_date} />
              </div>
            </>
          )}
          {!loading && data && !data.valid && (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-destructive/15 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="mt-4 font-outfit text-2xl font-semibold">Invalid certificate</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {data.message || "This certificate was not found or has been revoked."}
              </p>
            </>
          )}

          <Link to="/">
            <Button variant="outline" className="mt-8 rounded-full">
              Visit TechSasi <ExternalLink className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1 border-b border-border/60 last:border-0">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`text-sm font-medium text-right ${mono ? "font-mono-jb" : ""}`}>{value}</div>
    </div>
  );
}
