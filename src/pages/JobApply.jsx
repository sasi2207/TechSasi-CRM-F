import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Globe, 
  FileText, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  Clock,
  Plus,
  Trash2,
  ExternalLink,
  Upload,
  FileCheck
} from "lucide-react";
import { fetchJobsFromAPI, submitJobApplicationAPI } from "./jobService"; 


export const JobApply = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [jobLoading, setJobLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    experienceYears: "",
    coverLetter: "",
  });

  // Resume File State
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState(null);

  // Dynamic Links State (Portfolio, GitHub, LinkedIn)
  const [linksList, setLinksList] = useState([]);
  const [currentLinkType, setCurrentLinkType] = useState("GitHub");
  const [currentLinkUrl, setCurrentLinkUrl] = useState("");
  const [linkError, setLinkError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // Fetch job details securely with timeout/fallback
  useEffect(() => {
    let isMounted = true;

    const getJobDetails = async () => {
      try {
        setJobLoading(true);
        setError(null);
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Request timeout")), 5000)
        );

        const fetchPromise = fetchJobsFromAPI();
        const allJobs = await Promise.race([fetchPromise, timeoutPromise]);

        if (!isMounted) return;

        if (Array.isArray(allJobs) && allJobs.length > 0) {
          const foundJob = allJobs.find((j) => String(j.id) === String(jobId));
          if (foundJob) {
            setJob(foundJob);
          } else {
            setError("Job position not found or has been closed.");
          }
        } else {
          setError("No job listings available from server.");
        }
      } catch (err) {
        console.error("Error fetching job:", err);
        if (isMounted) {
          setError("Failed to fetch job details. Please check your backend connection.");
        }
      } finally {
        if (isMounted) {
          setJobLoading(false);
        }
      }
    };

    if (jobId) {
      getJobDetails();
    } else {
      setError("Invalid Job ID.");
      setJobLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [jobId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Resume File Change & Validation (Max 2MB & PDF/Docx check)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setResumeError(null);

    if (!file) return;

    // Check File Size (2MB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setResumeError("File size exceeds 2MB limit. Please upload a smaller file.");
      e.target.value = ""; // Reset input
      setResumeFile(null);
      return;
    }

    // Optional format check (PDF / DOC / DOCX)
    const allowedTypes = [
      "application/pdf", 
      "application/msword", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setResumeError("Only PDF or Word documents are allowed.");
      e.target.value = "";
      setResumeFile(null);
      return;
    }

    setResumeFile(file);
  };

  // Add Link Handler
  const handleAddLink = () => {
    if (!currentLinkUrl.trim()) {
      setLinkError("Please enter a valid URL.");
      return;
    }

    try {
      new URL(currentLinkUrl);
    } catch (_) {
      setLinkError("Please enter a valid URL starting with https://");
      return;
    }

    const newLinkItem = {
      id: Date.now().toString(),
      type: currentLinkType,
      url: currentLinkUrl.trim(),
    };

    setLinksList([...linksList, newLinkItem]);
    setCurrentLinkUrl("");
    setLinkError("");
  };

  const handleRemoveLink = (id) => {
    setLinksList(linksList.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setResumeError("Please upload your resume file.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const dataToSend = new FormData();
      dataToSend.append("job_id", String(job?.id || ""));
      dataToSend.append("job_title", job?.title || "");
      dataToSend.append("department", job?.department || "");
      dataToSend.append("full_name", formData.fullName);
      dataToSend.append("email", formData.email);
      dataToSend.append("phone", formData.phone);
      dataToSend.append("experience_years", formData.experienceYears);
      dataToSend.append("cover_letter", formData.coverLetter);
      dataToSend.append("professional_links", JSON.stringify(linksList));
      dataToSend.append("resume", resumeFile);
      dataToSend.append("applied_at", new Date().toISOString());

      await submitJobApplicationAPI(dataToSend);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (jobLoading) {
    return (
      
        <div className="min-h-[80vh] bg-black text-white flex items-center justify-center font-mono">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-400 text-sm">Loading position details...</p>
          </div>
        </div>
   
    );
  }

  return (
    
      <section className="min-h-screen bg-black text-white py-12 md:py-20 relative overflow-hidden tech-grid-pattern">
        <style>{`
          .tech-grid-pattern {
            background-size: 40px 40px;
            background-image: 
              linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          }
        `}</style>

        {/* Ambient Glow */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          
          {/* Navigation Back Button */}
          <Link 
            to="/careers" 
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-amber-400 mb-8 transition cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to Open Positions
          </Link>

          {!job || error ? (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
              <h2 className="text-2xl font-bold text-white">Application Error</h2>
              <p className="text-slate-400 text-sm">{error || "Requested job opening is unavailable."}</p>
              <button
                onClick={() => navigate("/careers")}
                className="bg-amber-500 text-slate-950 px-6 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider hover:bg-amber-400 transition cursor-pointer"
              >
                Browse Open Careers
              </button>
            </div>
          ) : submitted ? (
            
            /* SUCCESS STATE */
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/90 border border-slate-800 p-8 md:p-12 rounded-3xl text-center space-y-6 shadow-2xl backdrop-blur-md"
            >
              <div className="w-16 h-16 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white">Application Submitted!</h2>
                <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
                  Thank you for applying for <span className="text-amber-400 font-semibold">{job.title}</span>. Our team will review your application and contact you soon.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate("/careers")}
                  className="bg-slate-800 text-white hover:bg-slate-700 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  View More Positions
                </button>
              </div>
            </motion.div>

          ) : (

            /* FORM STATE */
            <div className="space-y-8">
              
              {/* Job Header Summary */}
              <div className="bg-slate-900/80 border border-slate-800 p-6 md:p-8 rounded-3xl backdrop-blur-sm">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded border border-amber-400/20">
                    {job.department}
                  </span>
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Clock size={12} /> {job.type}
                  </span>
                </div>
                
                <h1 className="text-2xl md:text-4xl font-black text-white mb-2">{job.title}</h1>
                
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} className="text-amber-400" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={14} className="text-amber-400" /> {job.experience}
                  </span>
                </div>
              </div>

              {/* Application Form */}
              <div className="bg-slate-900 border border-slate-800 p-6 md:p-10 rounded-3xl shadow-2xl space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h3 className="text-xl font-extrabold text-white">Candidate Information</h3>
                  <p className="text-slate-400 text-xs mt-1">Please fill in your correct details and upload your resume.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <User size={14} className="text-amber-400" /> Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Sasi Kumar"
                      className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-amber-500 text-white transition"
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                        <Mail size={14} className="text-amber-400" /> Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g. sasi@example.com"
                        className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-amber-500 text-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                        <Phone size={14} className="text-amber-400" /> Phone / WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g. +91 9876543210"
                        className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-amber-500 text-white transition"
                      />
                    </div>
                  </div>

                  {/* Years of Experience */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <Briefcase size={14} className="text-amber-400" /> Total Years of Relevant Experience *
                    </label>
                    <input
                      type="text"
                      name="experienceYears"
                      required
                      value={formData.experienceYears}
                      onChange={handleChange}
                      placeholder="e.g. Fresher / 2 Years in React.js"
                      className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-amber-500 text-white transition"
                    />
                  </div>

                  {/* DYNAMIC PROFESSIONAL LINKS */}
                  <div className="bg-black/40 border border-slate-800 p-4 md:p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <Globe size={14} className="text-amber-400" /> Professional Profiles & Portfolios
                      </label>
                      <span className="text-[10px] text-slate-500">Optional</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <select
                        value={currentLinkType}
                        onChange={(e) => setCurrentLinkType(e.target.value)}
                        className="bg-black border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-amber-400 font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="GitHub">GitHub</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Portfolio">Portfolio</option>
                        <option value="Other">Other</option>
                      </select>

                      <div className="sm:col-span-3 flex gap-2">
                        <input
                          type="url"
                          value={currentLinkUrl}
                          onChange={(e) => {
                            setCurrentLinkUrl(e.target.value);
                            setLinkError("");
                          }}
                          placeholder="https://..."
                          className="flex-1 bg-black border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-amber-500 text-white transition"
                        />
                        <button
                          type="button"
                          onClick={handleAddLink}
                          className="bg-amber-500 text-slate-950 px-4 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider hover:bg-amber-400 transition cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          <Plus size={16} /> Add
                        </button>
                      </div>
                    </div>

                    {linkError && <p className="text-red-400 text-[11px]">{linkError}</p>}

                    {linksList.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <p className="text-[11px] font-semibold text-slate-400">Added Links ({linksList.length}):</p>
                        <div className="flex flex-col gap-2">
                          <AnimatePresence>
                            {linksList.map((item) => (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex items-center justify-between bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-xs"
                              >
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                                    {item.type}
                                  </span>
                                  <a 
                                    href={item.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-slate-300 hover:text-amber-400 truncate flex items-center gap-1 transition"
                                  >
                                    {item.url} <ExternalLink size={11} />
                                  </a>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveLink(item.id)}
                                  className="text-slate-500 hover:text-red-400 transition p-1 cursor-pointer shrink-0"
                                  title="Remove link"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* MANUAL RESUME UPLOAD (Max 2MB Limit) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <FileText size={14} className="text-amber-400" /> Upload Resume (PDF / DOCX, Max 2MB) *
                    </label>

                    <div className="relative border-2 border-dashed border-slate-800 hover:border-amber-500/50 bg-black rounded-2xl p-6 text-center transition group cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        required
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      
                      <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                        {resumeFile ? (
                          <>
                            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                              <FileCheck size={20} />
                            </div>
                            <p className="text-xs font-bold text-amber-400">{resumeFile.name}</p>
                            <p className="text-[10px] text-slate-500">
                              {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB — Ready to submit
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-full bg-slate-900 text-slate-400 group-hover:text-amber-400 flex items-center justify-center border border-slate-800 transition">
                              <Upload size={18} />
                            </div>
                            <p className="text-xs text-slate-300 font-semibold">
                              Drag & drop your resume here, or <span className="text-amber-400 underline">browse</span>
                            </p>
                            <p className="text-[10px] text-slate-500">Supports PDF, DOC, DOCX up to 2MB</p>
                          </>
                        )}
                      </div>
                    </div>

                    {resumeError && <p className="text-red-400 text-xs mt-1 font-medium">{resumeError}</p>}
                  </div>

                  {/* Cover Letter / Note */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Cover Note / Why should we hire you?
                    </label>
                    <textarea
                      name="coverLetter"
                      rows={4}
                      value={formData.coverLetter}
                      onChange={handleChange}
                      placeholder="Briefly describe your key skills, projects, or achievements..."
                      className="w-full bg-black border border-slate-800 rounded-xl p-4 text-xs sm:text-sm focus:outline-none focus:border-amber-500 text-white resize-none transition"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold py-4 rounded-xl uppercase tracking-wider text-xs sm:text-sm hover:opacity-95 transition shadow-lg shadow-amber-500/10 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      "Submitting Application..."
                    ) : (
                      <>
                        Submit Application <Send size={15} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>
   
  );
};