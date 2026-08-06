import { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { BookOpen, Briefcase, TrendingUp, Target, Award, Phone, Globe, MapPin, Calendar, BadgeCheck } from "lucide-react";

/**
 * CertificateTemplate — portrait A4-styled certificate that mimics the TechSasi brand reference.
 * A4 portrait ≈ 794 × 1123 px at 96dpi. We render at 800 × 1131 for html2canvas.
 * All measurements are absolute-positioned to guarantee pixel-consistent PDF export.
 */
const CertificateTemplate = forwardRef(function CertificateTemplate({ data, verifyUrl }, ref) {
  const {
    certificate_id = "TS/INT/2026/0001",
    student_name = "Your Name Here",
    course_title = "Full Stack Development",
    program_type = "Internship Training",
    start_date = "01 Feb 2026",
    end_date = "31 Jul 2026",
    issue_date = "01 Aug 2026",
    issued_by_name = "Sasikumar",
    issued_by_title = "Founder & CEO",
    manager_name = "Training Manager",
    manager_title = "TechSasi",
  } = data || {};

  const fmtDate = (d) => {
    if (!d) return "-";
    try {
      const dt = new Date(d);
      if (!isNaN(dt.getTime())) {
        return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
      }
    } catch { /* noop */ }
    return d;
  };

  return (
    <div
      ref={ref}
      data-testid="certificate-template"
      style={{
        width: "800px",
        height: "1131px",
        background: "#FFFFFF",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
        color: "#111111",
        boxShadow: "0 20px 60px -20px rgba(0,0,0,0.35)",
      }}
    >
      {/* Outer thin frame */}
      <div style={{ position: "absolute", inset: 16, border: "1.5px solid #FF6B00", borderRadius: 6 }} />
      <div style={{ position: "absolute", inset: 22, border: "0.5px solid #FF6B00", borderRadius: 4, opacity: 0.5 }} />

      {/* Top-left black diagonal corner with laurel/stars badge */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, width: 260, height: 190,
          background: "#111111",
          clipPath: "polygon(0 0, 100% 0, 0 100%)",
        }}
      />
      <div style={{ position: "absolute", top: 30, left: 26, color: "#FFA766", width: 190 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* laurel + stars */}
          <svg width="42" height="34" viewBox="0 0 42 34" fill="none">
            <path d="M6 24 C 4 14, 12 6, 21 5" stroke="#FFA766" strokeWidth="1.5" fill="none" />
            <path d="M9 26 L 11 22 M12 21 L 14 17 M15 16 L 18 13 M19 12 L 22 10" stroke="#FFA766" strokeWidth="1.2" />
            <path d="M36 24 C 38 14, 30 6, 21 5" stroke="#FFA766" strokeWidth="1.5" fill="none" />
            <path d="M33 26 L 31 22 M30 21 L 28 17 M27 16 L 24 13 M23 12 L 20 10" stroke="#FFA766" strokeWidth="1.2" />
            <polygon points="14,8 15,10 17,10 15.5,11.5 16,13.5 14,12.5 12,13.5 12.5,11.5 11,10 13,10" fill="#FFA766" />
            <polygon points="21,4 22,6 24,6 22.5,7.5 23,9.5 21,8.5 19,9.5 19.5,7.5 18,6 20,6" fill="#FFA766" />
            <polygon points="28,8 29,10 31,10 29.5,11.5 30,13.5 28,12.5 26,13.5 26.5,11.5 25,10 27,10" fill="#FFA766" />
          </svg>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", marginTop: 12, color: "#FFFFFF" }}>
          EMPOWERING
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", color: "#FF6B00" }}>
          TOMORROW'S
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", color: "#FF6B00" }}>
          TECHNOLOGISTS
        </div>
      </div>

      {/* Orange diagonal cut across top-left, sitting under the black corner */}
      <div
        style={{
          position: "absolute",
          top: 158, left: 0, width: 200, height: 90,
          background: "#FF6B00",
          clipPath: "polygon(0 0, 100% 0, 0 100%)",
        }}
      />

      {/* Top-right orange trim */}
      <div
        style={{
          position: "absolute",
          top: 0, right: 0, width: 40, height: 250,
          background: "linear-gradient(180deg, #FF6B00 0%, #FF8C33 100%)",
          clipPath: "polygon(100% 0, 100% 100%, 0 0)",
        }}
      />

      {/* Bottom-right orange decorative shapes (compact, below features row) */}
      <div
        style={{
          position: "absolute",
          bottom: 42, right: 0, width: 220, height: 68,
          background: "#FF6B00",
          clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
          opacity: 0.95,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 42, right: 0, width: 150, height: 46,
          background: "#111111",
          clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
        }}
      />

      {/* Bottom-left small orange fin */}
      <div
        style={{
          position: "absolute",
          bottom: 42, left: 0, width: 90, height: 50,
          background: "#FF6B00",
          clipPath: "polygon(0 100%, 0 0, 100% 100%)",
          opacity: 0.9,
        }}
      />

      {/* Header block — logo + certificate id + date */}
      <div style={{ position: "absolute", top: 60, left: 0, right: 0, display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
        {/* TS logo mark */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 4, marginBottom: 8 }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 88, fontWeight: 900, color: "#111111", lineHeight: 1, letterSpacing: "-4px" }}>T</span>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 88, fontWeight: 900, color: "#FF6B00", lineHeight: 1, letterSpacing: "-4px" }}>S</span>
            {/* Pixel scatter */}
            <div style={{ position: "absolute", top: -6, right: -18, display: "flex", gap: 2 }}>
              <div style={{ width: 6, height: 6, background: "#FF6B00" }} />
              <div style={{ width: 6, height: 6, background: "#FF6B00", opacity: 0.6 }} />
            </div>
            <div style={{ position: "absolute", top: 4, right: -28, display: "flex", gap: 2 }}>
              <div style={{ width: 6, height: 6, background: "#FF6B00", opacity: 0.8 }} />
            </div>
            <div style={{ position: "absolute", top: 14, right: -22, display: "flex", gap: 2 }}>
              <div style={{ width: 5, height: 5, background: "#FF6B00", opacity: 0.5 }} />
            </div>
          </div>
        </div>

        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, letterSpacing: "6px", fontSize: 30, marginTop: -4 }}>
          <span style={{ color: "#111111" }}>TECH</span>
          <span style={{ color: "#FF6B00" }}>SASI</span>
        </div>
        <div style={{ fontSize: 11, letterSpacing: "3px", color: "#111111", marginTop: 6, fontWeight: 500 }}>
          LEARN <span style={{ color: "#FF6B00", margin: "0 6px" }}>•</span> BUILD <span style={{ color: "#FF6B00", margin: "0 6px" }}>•</span> GROW
        </div>
      </div>

      {/* Certificate ID card (top right) */}
      <div style={{ position: "absolute", top: 80, right: 60, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 6, background: "#FF6B00", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BadgeCheck size={16} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "1.5px", color: "#111", fontWeight: 700 }}>CERTIFICATE ID</div>
          <div style={{ fontSize: 12, color: "#FF6B00", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{certificate_id}</div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 130, right: 60, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 6, background: "#FF6B00", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Calendar size={16} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "1.5px", color: "#111", fontWeight: 700 }}>DATE OF ISSUE</div>
          <div style={{ fontSize: 12, color: "#111", fontWeight: 600 }}>{fmtDate(issue_date)}</div>
        </div>
      </div>

      {/* CERTIFICATE title */}
      <div style={{ position: "absolute", top: 320, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: "'Playfair Display', 'Outfit', serif", fontSize: 66, fontWeight: 900, letterSpacing: "8px", color: "#111111" }}>
          CERTIFICATE
        </div>
        {/* Subtitle bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 6, gap: 12 }}>
          <div style={{ height: 2, width: 40, background: "#FF6B00" }} />
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, letterSpacing: "5px", color: "#FF6B00", fontWeight: 700 }}>
            OF {program_type.toUpperCase()}
          </div>
          <div style={{ height: 2, width: 40, background: "#FF6B00" }} />
        </div>
      </div>

      {/* Certify body */}
      <div style={{ position: "absolute", top: 480, left: 60, right: 60, textAlign: "center" }}>
        <div style={{ fontSize: 15, color: "#4a4a4a", fontStyle: "italic" }}>This is to certify that</div>
        <div
          data-testid="certificate-name"
          style={{
            fontFamily: "'Great Vibes', 'Allura', cursive",
            fontSize: 78,
            color: "#111111",
            lineHeight: 1.1,
            marginTop: 8,
          }}
        >
          {student_name}
        </div>
        {/* Fancy divider */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 6, gap: 8 }}>
          <div style={{ height: 1, width: 200, background: "#FF6B00" }} />
          <svg width="12" height="12" viewBox="0 0 12 12"><polygon points="6,0 8,6 6,12 4,6" fill="#FF6B00" /></svg>
          <div style={{ height: 1, width: 200, background: "#FF6B00" }} />
        </div>

        <div style={{ marginTop: 20, fontSize: 14, color: "#222", lineHeight: 1.7 }}>
          has successfully completed the <span style={{ fontWeight: 700 }}>{course_title}</span> program at{" "}
          <span style={{ color: "#FF6B00", fontWeight: 700 }}>TechSasi</span> from{" "}
          <span style={{ fontWeight: 700 }}>{fmtDate(start_date)}</span> to{" "}
          <span style={{ fontWeight: 700 }}>{fmtDate(end_date)}</span>.
          <br />
          Throughout this program, the participant demonstrated dedication, enthusiasm, and a strong
          <br />
          willingness to learn and explore new technologies.
          <br />
          We wish them all the best for their future endeavors.
        </div>
      </div>

      {/* Golden badge with ribbons */}
      <div style={{ position: "absolute", top: 780, left: "50%", transform: "translateX(-50%)", width: 140, height: 170 }}>
        {/* ribbons */}
        <div style={{ position: "absolute", bottom: -14, left: 20, width: 30, height: 70, background: "#FF6B00", clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)" }} />
        <div style={{ position: "absolute", bottom: -14, right: 20, width: 30, height: 70, background: "#111111", clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)" }} />
        {/* outer ring */}
        <div style={{
          position: "absolute", top: 0, left: 10, width: 120, height: 120, borderRadius: "50%",
          background: "conic-gradient(#e6a23c, #b8791f, #f3c96a, #b8791f, #e6a23c)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
        }}>
          {/* inner dark disc */}
          <div style={{
            width: 96, height: 96, borderRadius: "50%",
            background: "#0f0f0f",
            border: "3px solid #d4a04a",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            color: "#f3c96a",
            textAlign: "center",
            padding: 8,
          }}>
            <div style={{ display: "flex", gap: 2, marginBottom: 2 }}>
              <svg width="9" height="9" viewBox="0 0 12 12"><polygon points="6,0 7.5,4.5 12,4.5 8.25,7.5 9.75,12 6,9 2.25,12 3.75,7.5 0,4.5 4.5,4.5" fill="#f3c96a"/></svg>
              <svg width="9" height="9" viewBox="0 0 12 12"><polygon points="6,0 7.5,4.5 12,4.5 8.25,7.5 9.75,12 6,9 2.25,12 3.75,7.5 0,4.5 4.5,4.5" fill="#f3c96a"/></svg>
              <svg width="9" height="9" viewBox="0 0 12 12"><polygon points="6,0 7.5,4.5 12,4.5 8.25,7.5 9.75,12 6,9 2.25,12 3.75,7.5 0,4.5 4.5,4.5" fill="#f3c96a"/></svg>
            </div>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "1px", lineHeight: 1.2 }}>
              {program_type.toUpperCase().split(" ")[0]}
            </div>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "1px", lineHeight: 1.2, color: "#ffdd88" }}>
              {(program_type.toUpperCase().split(" ")[1] || "TRAINING")}
            </div>
            <div style={{
              marginTop: 4, background: "#FF6B00", color: "#fff",
              padding: "2px 8px", borderRadius: 2, fontSize: 9, fontWeight: 800, letterSpacing: "1px",
            }}>
              COMPLETED
            </div>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div style={{ position: "absolute", top: 820, left: 90, textAlign: "center", width: 200 }}>
        <div style={{ fontFamily: "'Great Vibes', cursive", fontSize: 34, color: "#111", lineHeight: 1 }}>
          {issued_by_name}
        </div>
        <div style={{ borderTop: "1px solid #111", marginTop: 10, paddingTop: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2px", color: "#111" }}>
            {issued_by_name.toUpperCase()}
          </div>
          <div style={{ fontSize: 10, color: "#FF6B00", fontWeight: 700, letterSpacing: "1.5px", marginTop: 2 }}>
            {issued_by_title.toUpperCase()}
          </div>
          <div style={{ fontSize: 10, color: "#666", marginTop: 1 }}>TECHSASI</div>
        </div>
      </div>

      <div style={{ position: "absolute", top: 820, right: 90, textAlign: "center", width: 200 }}>
        <div style={{ fontFamily: "'Great Vibes', cursive", fontSize: 34, color: "#111", lineHeight: 1 }}>
          {manager_name}
        </div>
        <div style={{ borderTop: "1px solid #111", marginTop: 10, paddingTop: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2px", color: "#111" }}>
            {manager_title.toUpperCase()}
          </div>
          <div style={{ fontSize: 10, color: "#FF6B00", fontWeight: 700, letterSpacing: "1.5px", marginTop: 2 }}>
            TECHSASI
          </div>
        </div>
      </div>

      {/* Features row */}
      <div style={{
        position: "absolute", top: 958, left: 60, right: 60,
        borderTop: "1px solid #e5e5e5", borderBottom: "1px solid #e5e5e5",
        padding: "10px 0",
        display: "flex", justifyContent: "space-around", alignItems: "center",
        background: "#ffffff",
        zIndex: 5,
      }}>
        {[
          { icon: BookOpen, l1: "PRACTICAL", l2: "LEARNING" },
          { icon: Briefcase, l1: "REAL-TIME", l2: "PROJECTS" },
          { icon: TrendingUp, l1: "CAREER", l2: "GROWTH" },
          { icon: Target, l1: "FUTURE", l2: "READY" },
        ].map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 4, background: "#FFF0E6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <f.icon size={14} color="#FF6B00" />
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, color: "#111", letterSpacing: "0.5px" }}>{f.l1}</div>
              <div style={{ fontSize: 9, fontWeight: 800, color: "#111", letterSpacing: "0.5px" }}>{f.l2}</div>
            </div>
          </div>
        ))}
      </div>

      {/* QR + Verify text */}
      <div style={{ position: "absolute", top: 1020, left: 40, display: "flex", alignItems: "center", gap: 10, zIndex: 6 }}>
        <div style={{ background: "#fff", padding: 3, border: "2px solid #FF6B00", borderRadius: 4 }}>
          <QRCodeSVG value={verifyUrl || "https://techsasi.com"} size={54} bgColor="#ffffff" fgColor="#111111" />
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#111", letterSpacing: "1.5px" }}>SCAN TO VERIFY</div>
          <div style={{ fontSize: 8, color: "#666", marginTop: 2, maxWidth: 180 }}>
            Verify the authenticity of this certificate by scanning the QR code.
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 42,
        background: "#111111",
        color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "space-around", padding: "0 24px",
        fontSize: 10, fontWeight: 500,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Globe size={12} color="#FF6B00" /> www.techsasi.com
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Phone size={12} color="#FF6B00" /> 74487 888 79
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <MapPin size={12} color="#FF6B00" /> Kolathur, Mettur, Salem – 636303
        </div>
      </div>
    </div>
  );
});

export default CertificateTemplate;
