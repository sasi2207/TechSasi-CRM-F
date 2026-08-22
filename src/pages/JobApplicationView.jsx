import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  Mail, 
  Phone, 
  FileText, 
  ExternalLink, 
  Trash2, 
  Search, 
  AlertCircle,
  Eye
} from "lucide-react";

import { 
  fetchJobApplicationsAPI, 
  updateJobApplicationStatusAPI, 
  deleteJobApplicationAPI, 
  getResumeFileUrl 
} from "./jobService";

export const JobApplicationView = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchJobApplicationsAPI();
      
      // SAFETY FIX: Ensure professional_links is always parsed as an array
      const normalizedData = (data || []).map(app => {
        let links = app.professional_links;
        if (typeof links === "string") {
          try {
            links = JSON.parse(links);
          } catch (e) {
            links = [];
          }
        }
        return {
          ...app,
          professional_links: Array.isArray(links) ? links : []
        };
      });

      setApplications(normalizedData);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError(err.message || "Network error. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateJobApplicationStatusAPI(appId, newStatus);
      
      setApplications(prev => 
        prev.map(app => app.id === appId ? { ...app, status: newStatus } : app)
      );
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      alert(err.message || "Failed to update status.");
    }
  };

  const handleDelete = async (appId) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;

    try {
      await deleteJobApplicationAPI(appId);
      setApplications(prev => prev.filter(app => app.id !== appId));
      if (selectedApp?.id === appId) setSelectedApp(null);
    } catch (err) {
      alert(err.message || "Failed to delete application.");
    }
  };

  const filteredApplications = applications.filter(app => 
    app.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="container mx-auto max-w-7xl space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded border border-amber-400/20">
              Admin CRM Dashboard
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-white mt-2">Job Applications</h1>
            <p className="text-slate-400 text-xs mt-1">Review candidate submissions, portfolios, and manage statuses.</p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-3 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search candidate or job..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 font-mono text-slate-400 space-y-3">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Loading applications...</p>
          </div>
        ) : error ? (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
            <p className="text-red-400 text-xs font-semibold">{error}</p>
            <button 
              onClick={fetchApplications}
              className="bg-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold uppercase cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-3xl text-center text-slate-400 text-xs">
            No job applications found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Applications List */}
            <div className="lg:col-span-1 space-y-3 max-h-[75vh] overflow-y-auto pr-1">
              {filteredApplications.map((app) => (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`bg-slate-900 border p-4 rounded-2xl cursor-pointer transition space-y-2 ${
                    selectedApp?.id === app.id ? "border-amber-500 bg-slate-800/50" : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-sm text-white">{app.full_name}</h4>
                      <p className="text-xs text-amber-400 font-semibold">{app.job_title}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      app.status === "Shortlisted" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      app.status === "Rejected" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                      "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                    <span>{app.department}</span>
                    <span>{app.experience_years} Exp</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Application View Panel */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl space-y-6">
              {selectedApp ? (
                <div className="space-y-6">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <h2 className="text-xl font-black text-white">{selectedApp.full_name}</h2>
                      <p className="text-xs text-amber-400 font-semibold mt-0.5">Applied for: {selectedApp.job_title}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-bold">Status:</span>
                      <select
                        value={selectedApp.status}
                        onChange={(e) => handleStatusChange(selectedApp.id, e.target.value)}
                        className="bg-black border border-slate-800 text-xs font-semibold text-amber-400 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      
                      <button
                        onClick={() => handleDelete(selectedApp.id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 p-2 rounded-xl transition cursor-pointer"
                        title="Delete Application"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-black/40 border border-slate-800 p-4 rounded-2xl space-y-2">
                      <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Contact Info</p>
                      <p className="flex items-center gap-2 text-slate-300"><Mail size={14} className="text-amber-400" /> {selectedApp.email}</p>
                      <p className="flex items-center gap-2 text-slate-300"><Phone size={14} className="text-amber-400" /> {selectedApp.phone}</p>
                    </div>

                    <div className="bg-black/40 border border-slate-800 p-4 rounded-2xl space-y-2">
                      <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Experience & Dept</p>
                      <p className="flex items-center gap-2 text-slate-300"><Briefcase size={14} className="text-amber-400" /> {selectedApp.experience_years} Experience</p>
                      <p className="text-slate-400">Department: <span className="text-white font-semibold">{selectedApp.department}</span></p>
                    </div>
                  </div>

                  {/* Professional Links */}
                  {selectedApp.professional_links && selectedApp.professional_links.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Professional Profiles</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedApp.professional_links.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-black border border-slate-800 hover:border-amber-500/50 px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:text-amber-400 transition"
                          >
                            <span className="font-bold text-amber-400 text-[10px]">{link.type}:</span>
                            {link.url} <ExternalLink size={11} />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedApp.cover_letter && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Cover Note</p>
                      <div className="bg-black/40 border border-slate-800 p-4 rounded-2xl text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {selectedApp.cover_letter}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <a
                      href={getResumeFileUrl(selectedApp.resume_file_path)} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-amber-500 text-slate-950 px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider hover:bg-amber-400 transition cursor-pointer shadow-md"
                    >
                      <FileText size={15} /> View / Download Resume
                    </a>
                  </div>

                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-24 space-y-3 text-slate-500">
                  <Eye size={36} className="text-slate-600" />
                  <p className="text-xs">Select any application from the left list to view complete details.</p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};