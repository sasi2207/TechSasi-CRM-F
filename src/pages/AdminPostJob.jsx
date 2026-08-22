import React, { useState, useEffect } from "react";
import { 
  fetchJobsFromAPI, 
  createJobAPI, 
  updateJobAPI, 
  deleteJobAPI 
} from "./jobService";

const TECH_SASI_ROLES = [
  "Frontend Developer (React / Next.js)",
  "Backend Developer (Node.js / Express)",
  "Python Developer",
  "PHP & Laravel Developer",
  "Spring Boot Developer",
  ".NET Developer",
  "Full Stack Developer (MERN / Next.js)",
  "AI Integration & Automation Developer",
  "Software Coding Trainer / Mentor",
  "UI/UX Designer",
  "Mobile App Developer (React Native / Flutter)",
  "Content Creator & AI Video Editor",
  "Office Staff / Administration",
  "Digital Marketing Executive"
];

const LOCATION_OPTIONS = [
  "Remote",
  "Chennai Office",
  "Hybrid (Chennai)",
  "On-site"
];

const AVAILABLE_REQUIREMENTS = [
  "AI Tools Knowledge (ChatGPT, Claude, etc.)",
  "AI Prompt Engineering & Automation",
  "Adobe Premiere Pro",
  "CapCut (Desktop / Mobile)",
  "Canva Pro Design Skills",
  "UI/UX Prototyping (Figma)",
  "React.js / Next.js",
  "Python & Django/FastAPI",
  "PHP & Laravel Framework",
  "Java & Spring Boot",
  "C# & .NET Core",
  "Tailwind CSS",
  "MongoDB / PostgreSQL / MySQL",
  "Good Communication & Documentation",
  "Basic Computer & Office Management"
];

export const AdminPostJob = () => {
  const [jobs, setJobs] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: TECH_SASI_ROLES[0],
    department: "Engineering",
    location: LOCATION_OPTIONS[0],
    type: "Full-time",
    experience: "2+ Years",
    gender: "Any",
    description: "",
  });

  const [selectedReqs, setSelectedReqs] = useState([]);
  const [customReq, setCustomReq] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await fetchJobsFromAPI();
      setJobs(data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  const handleCheckboxChange = (tech) => {
    if (selectedReqs.includes(tech)) {
      setSelectedReqs(selectedReqs.filter(item => item !== tech));
    } else {
      setSelectedReqs([...selectedReqs, tech]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");

    try {
      let finalRequirements = [...selectedReqs];
      if (customReq.trim()) {
        const customArr = customReq.split(",").map(r => r.trim()).filter(Boolean);
        finalRequirements = [...finalRequirements, ...customArr];
      }

      if (finalRequirements.length === 0) {
        alert("Please select or enter at least one requirement.");
        setLoading(false);
        return;
      }

      const payload = {
        ...formData,
        requirements: finalRequirements
      };

      if (editingId) {
        await updateJobAPI(editingId, payload);
        setSuccessMsg("Job updated successfully!");
      } else {
        await createJobAPI(payload);
        setSuccessMsg("Job posted successfully and live!");
      }

      resetForm();
      loadJobs();
    } catch (err) {
      console.error(err);
      alert("Operation failed. Make sure Python server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (job) => {
    if (!job.id) return;
    setEditingId(job.id);
    setFormData({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      experience: job.experience,
      gender: job.gender || "Any",
      description: job.description,
    });
    setSelectedReqs(job.requirements || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (id) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this job posting?")) return;

    try {
      await deleteJobAPI(id);
      setJobs(jobs.filter(j => j.id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting job.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: TECH_SASI_ROLES[0],
      department: "Engineering",
      location: LOCATION_OPTIONS[0],
      type: "Full-time",
      experience: "2+ Years",
      gender: "Any",
      description: "",
    });
    setSelectedReqs([]);
    setCustomReq("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      
      {/* 1. FORM SECTION */}
      <div className="bg-slate-900 border border-slate-800 p-5 sm:p-8 md:p-10 rounded-2xl md:rounded-3xl text-white shadow-2xl">
        <div className="mb-6 sm:mb-8 border-b border-slate-800 pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
              <span className="text-amber-400">//</span> {editingId ? "Update Career Opening" : "Post Tech Sasi Career Opening"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {editingId ? "Modify job listing details below." : "Fill out the form below to publish a new job opening instantly."}
            </p>
          </div>
          {editingId && (
            <button 
              type="button" 
              onClick={resetForm}
              className="bg-slate-800 text-xs px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-700 transition cursor-pointer"
            >
              Cancel Edit
            </button>
          )}
        </div>
        
        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 sm:p-4 rounded-xl mb-6 text-xs sm:text-sm font-medium">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Job Title (Tech Sasi Role)
            </label>
            <select 
              value={formData.title}
              onChange={(e) => {
                const selected = e.target.value;
                let dept = "Engineering";
                if (selected.includes("Trainer")) dept = "Coaching";
                else if (selected.includes("Content") || selected.includes("Video")) dept = "Media";
                else if (selected.includes("Office")) dept = "Administration";
                else if (selected.includes("AI")) dept = "AI & Innovation";
                
                setFormData({...formData, title: selected, department: dept});
              }}
              className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-amber-500 text-white transition cursor-pointer"
            >
              {TECH_SASI_ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Department</label>
              <select 
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-amber-500 text-white transition cursor-pointer"
              >
                <option value="Engineering">Engineering</option>
                <option value="AI & Innovation">AI & Innovation</option>
                <option value="Coaching">Coaching</option>
                <option value="Media">Media</option>
                <option value="Administration">Administration</option>
                <option value="Design">Design</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Employment Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-amber-500 text-white transition cursor-pointer"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Location</label>
              <select 
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-amber-500 text-white transition cursor-pointer"
              >
                {LOCATION_OPTIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Experience Required</label>
              <input 
                type="text" 
                required
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                placeholder="e.g. 2+ Years / Fresher" 
                className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-amber-500 text-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Gender Preference</label>
            <select 
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
              className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-amber-500 text-white transition cursor-pointer"
            >
              <option value="Any">Any (Male / Female)</option>
              <option value="Male">Male Preferred</option>
              <option value="Female">Female Preferred</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Job Description</label>
            <textarea 
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Write role responsibilities and expectations..." 
              className="w-full bg-black border border-slate-800 rounded-xl p-4 text-xs sm:text-sm focus:outline-none focus:border-amber-500 text-white resize-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Key Requirements & Tools (Select checkboxes below)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/50 border border-slate-800 p-4 rounded-xl max-h-60 overflow-y-auto">
              {AVAILABLE_REQUIREMENTS.map((tech) => (
                <label key={tech} className="flex items-start sm:items-center gap-3 text-xs text-slate-300 cursor-pointer hover:text-white transition py-1">
                  <input 
                    type="checkbox"
                    checked={selectedReqs.includes(tech)}
                    onChange={() => handleCheckboxChange(tech)}
                    className="w-4 h-4 mt-0.5 sm:mt-0 rounded border-slate-700 bg-black text-amber-500 focus:ring-0 accent-amber-500 cursor-pointer flex-shrink-0"
                  />
                  <span className="leading-tight">{tech}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Additional Requirements (Optional - comma separated)
            </label>
            <input 
              type="text" 
              value={customReq}
              onChange={(e) => setCustomReq(e.target.value)}
              placeholder="e.g. Photoshop, Excel, Midjourney" 
              className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-amber-500 text-white transition"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold py-3.5 sm:py-4 rounded-xl uppercase tracking-wider text-xs sm:text-sm hover:opacity-95 transition-all shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Processing..." : editingId ? "Update Job Posting" : "Publish Job via Python API"}
          </button>
        </form>
      </div>

      {/* 2. ACTIVE LIST & MANAGE SECTION */}
      <div className="bg-slate-900 border border-slate-800 p-5 sm:p-8 md:p-10 rounded-2xl md:rounded-3xl text-white shadow-2xl">
        <div className="mb-6 flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">Active Job Openings List</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">All posted openings from your database are listed below.</p>
          </div>
          <button 
            onClick={loadJobs}
            className="bg-slate-800 text-xs px-3.5 py-2 rounded-xl text-slate-300 hover:bg-slate-700 transition cursor-pointer"
          >
            🔄 Refresh List
          </button>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No job postings found. Fill out the form above to add one!
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-black/50 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs px-2.5 py-0.5 bg-amber-500/10 text-amber-400 rounded-md font-semibold">{job.department}</span>
                    <span className="text-xs text-slate-400">• {job.type}</span>
                    <span className="text-xs text-slate-400">• {job.location}</span>
                    <span className="text-xs text-slate-400">• Exp: {job.experience}</span>
                  </div>
                  <h4 className="text-base font-bold text-white">{job.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{job.description}</p>
                  
                  {job.requirements && job.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.requirements.map((req, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                          {req}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-shrink-0">
                  <button 
                    onClick={() => handleEditClick(job)}
                    className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-blue-600/30 transition cursor-pointer"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(job.id)}
                    className="bg-red-600/20 text-red-400 border border-red-500/30 px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-red-600/30 transition cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};