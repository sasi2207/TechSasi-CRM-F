import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, MapPin, Clock, ArrowRight, Building, AlertCircle, X, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchJobsFromAPI } from "./jobService"; 


export const Careers = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  
  // State for Job Details Modal
  const [selectedJob, setSelectedJob] = useState(null);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchJobsFromAPI();
      setJobs(data);
    } catch (err) {
      console.error("Error loading jobs:", err);
      setError("Failed to load job openings from server. Please check if Python backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  // Dynamic Department Filter Tabs from Database
  const availableDepartments = ["All", ...Array.from(new Set(jobs.map(j => j.department).filter(Boolean)))];

  // Strict Department Filter
  const filteredJobs = selectedDepartment === "All" 
    ? jobs 
    : jobs.filter(j => {
        if (!j.department) return false;
        return j.department.trim().toLowerCase() === selectedDepartment.trim().toLowerCase();
      });

  return (
    
      <section className="py-24 bg-black text-white relative overflow-hidden tech-grid-pattern min-h-screen">
        <style>{`
          .tech-grid-pattern {
            background-size: 40px 40px;
            background-image: 
              linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
          }
        `}</style>

        {/* Ambient Glow Accents */}
        <div className="absolute top-20 right-10 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[130px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 inline-flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5" /> Join Our Team
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight">
              Build Your Career With <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">Us</span>
            </h1>
            <p className="text-slate-400 text-base md:text-lg">
              Be part of our high-performing dev agency and tech institute. Check out our open roles below.
            </p>
          </div>

          {/* Dynamic Department Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {availableDepartments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedDepartment === dept
                    ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                    : "bg-slate-900/60 border border-slate-800 text-slate-300 hover:bg-slate-900"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Job Listings Grid / States */}
          {loading ? (
            <div className="text-center py-20 text-slate-500 font-mono animate-pulse">
              Loading open positions from server...
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-red-950/20 border border-red-900/50 rounded-2xl max-w-xl mx-auto text-red-400 p-6">
              <AlertCircle className="w-10 h-10 mx-auto mb-2" />
              <p className="text-sm">{error}</p>
              <button 
                onClick={loadJobs} 
                className="mt-4 bg-red-500/20 border border-red-500/40 text-red-300 text-xs px-4 py-2 rounded-xl hover:bg-red-500/30 transition cursor-pointer"
              >
                Retry Connection
              </button>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/20 border border-slate-800/80 rounded-2xl max-w-xl mx-auto">
              <Building className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white">No Openings Right Now in "{selectedDepartment}"</h3>
              <p className="text-slate-400 text-sm mt-1">Please check other departments or check back later.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {filteredJobs.map((job) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-black/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-6 flex flex-col justify-between shadow-xl transition-all group backdrop-blur-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded border border-amber-400/20">
                        {job.department}
                      </span>
                      <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                        <Clock size={12} /> {job.type}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors mb-2">
                      {job.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mb-4">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} className="text-amber-400" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase size={14} className="text-amber-400" /> {job.experience}
                      </span>
                      {job.gender && (
                        <span className="text-slate-400">• Gender: {job.gender}</span>
                      )}
                    </div>

                    <p className="text-slate-400 text-sm mb-4 line-clamp-3">
                      {job.description}
                    </p>

                    {job.requirements && job.requirements.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {job.requirements.slice(0, 4).map((req, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded">
                            {req}
                          </span>
                        ))}
                        {job.requirements.length > 4 && (
                          <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                            +{job.requirements.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-900 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="text-xs font-semibold text-slate-300 hover:text-amber-400 underline transition cursor-pointer"
                    >
                      View Full Details
                    </button>

                    <Link 
                      to={`/Careers/apply/${job.id}`}
                      className="bg-amber-500 text-black px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                    >
                      Apply Now
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* FULL DETAILS MODAL */}
        <AnimatePresence>
          {selectedJob && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-slate-900 border border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8 text-white shadow-2xl relative"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedJob(null)}
                  className="absolute top-6 right-6 bg-slate-800 hover:bg-slate-700 p-2 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X size={18} />
                </button>

                <div className="space-y-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                        {selectedJob.department}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">• {selectedJob.type}</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight">{selectedJob.title}</h2>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-black/50 border border-slate-800 p-4 rounded-2xl">
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Location</span>
                      <span className="text-xs font-semibold text-white flex items-center gap-1 mt-0.5">
                        <MapPin size={13} className="text-amber-400" /> {selectedJob.location}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Experience</span>
                      <span className="text-xs font-semibold text-white flex items-center gap-1 mt-0.5">
                        <Briefcase size={13} className="text-amber-400" /> {selectedJob.experience}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Gender Preference</span>
                      <span className="text-xs font-semibold text-white mt-0.5 block">
                        {selectedJob.gender || "Any"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Role Description & Responsibilities</h4>
                    <div className="bg-black/30 border border-slate-800/80 p-4 rounded-xl text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                      {selectedJob.description}
                    </div>
                  </div>

                  {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Key Requirements & Tech Stack</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedJob.requirements.map((req, idx) => (
                          <div key={idx} className="flex items-start gap-2 bg-slate-800/50 border border-slate-800 p-2.5 rounded-xl text-xs text-slate-200">
                            <CheckCircle2 size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                            <span>{req}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedJob(null)}
                      className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      Close
                    </button>
                    <Link
                      to={`/careers/apply/${selectedJob.id}`}
                      onClick={() => setSelectedJob(null)}
                      className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-6 py-3 rounded-xl hover:opacity-90 transition shadow-lg shadow-amber-500/20"
                    >
                      Apply For This Position <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </section>
   
  );
};