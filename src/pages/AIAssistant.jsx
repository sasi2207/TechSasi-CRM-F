import { Sparkles } from "lucide-react";

export default function AIAssistant() {
  return (
    <div className="max-w-3xl mx-auto text-center py-20">
      <div className="w-14 h-14 rounded-2xl mx-auto bg-gradient-to-br from-[#FF6B00] to-[#FF8C33] flex items-center justify-center shadow-xl shadow-primary/25 mb-6">
        <Sparkles className="w-6 h-6 text-white" />
      </div>
      <h1 className="font-outfit text-3xl sm:text-4xl font-semibold tracking-tight">TechSasi AI Assistant</h1>
      <p className="mt-3 text-muted-foreground">
        Tap the floating orange button at the bottom-right to chat with TechSasi AI (powered by Claude Sonnet 5).
        Ask about revenue, admissions, attendance trends, sales pipeline, or how to improve fee collection.
      </p>
      <div className="mt-8 grid sm:grid-cols-2 gap-4 text-left">
        {[
          { t: "Business insights", d: "Weekly summary of pipeline, revenue and admissions." },
          { t: "Student support", d: "Resume review, interview prep, project ideas." },
          { t: "Trainer insights", d: "At-risk students, batch performance, next steps." },
          { t: "Admin advisory", d: "Fee collection strategies, staffing suggestions." },
        ].map((x) => (
          <div key={x.t} className="rounded-2xl bg-card border border-border p-5">
            <div className="font-outfit font-semibold">{x.t}</div>
            <p className="text-sm text-muted-foreground mt-1">{x.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
