// src/services/jobService.js

// Global API Base URL configuration using Vite Environment Variables
// Fallback to localhost if VITE_API_BASE_URL is not defined in your .env file
// const API_BASE_URL = "http://localhost:8000/api"; 
const API_BASE_URL = "https://techsasi-crm-b.onrender.com/api"; 

// ==========================================
// PART 1: JOB POSTINGS (Admin Management)
// ==========================================

// 1. GET ALL JOBS (Read)
export const fetchJobsFromAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Failed to fetch jobs");
    const data = await response.json();
    return Array.isArray(data) ? data : (data.data || []);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
};

// 2. CREATE JOB (Post)
export const createJobAPI = async (jobData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobData),
    });

    if (!response.ok) throw new Error("Failed to create job posting");
    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error("Error creating job:", error);
    throw error;
  }
};

// 3. UPDATE JOB (Update / Put)
export const updateJobAPI = async (id, jobData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobData),
    });

    if (!response.ok) throw new Error("Failed to update job posting");
    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error(`Error updating job ${id}:`, error);
    throw error;
  }
};

// 4. DELETE JOB (Delete)
export const deleteJobAPI = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Failed to delete job posting");
    return true;
  } catch (error) {
    console.error(`Error deleting job ${id}:`, error);
    throw error;
  }
};


// ==========================================
// PART 2: JOB APPLICATIONS (Candidates)
// ==========================================

// 1. SUBMIT JOB APPLICATION (POST with FormData & Resume)
export const submitJobApplicationAPI = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/applications`, {
      method: "POST",
      body: formData, // Do not manually set Content-Type header when sending FormData
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || "Failed to submit application");
    return result;
  } catch (error) {
    console.error("Error submitting application:", error);
    throw error;
  }
};

// 2. GET ALL JOB APPLICATIONS (Read)
export const fetchJobApplicationsAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/applications`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Failed to fetch applications");
    const data = await response.json();
    
    // Safely parse whether the backend returns a raw array or a wrapped object
    return Array.isArray(data) ? data : (data.data || []);
  } catch (error) {
    console.error("Error fetching applications:", error);
    throw error;
  }
};

// 3. UPDATE JOB APPLICATION STATUS (PUT)
export const updateJobApplicationStatusAPI = async (appId, status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/applications/${appId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || "Failed to update application status");
    return result;
  } catch (error) {
    console.error(`Error updating application ${appId}:`, error);
    throw error;
  }
};

// 4. DELETE JOB APPLICATION (DELETE)
export const deleteJobApplicationAPI = async (appId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/applications/${appId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || "Failed to delete application");
    return true;
  } catch (error) {
    console.error(`Error deleting application ${appId}:`, error);
    throw error;
  }
};

// 5. RESUME FILE URL HELPER
export const getResumeFileUrl = (filePath) => {
  if (!filePath) return "";
  const rootBaseUrl = `${API_BASE_URL} `|| "http://localhost:8000";
  // Clean up duplicate slashes if filePath starts with a slash
  const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
  return `${rootBaseUrl}/${cleanPath}`;
};