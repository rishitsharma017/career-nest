import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchJobById } from "../services/jobService";
import { createApplication, fetchApplications } from "../services/applicationService";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");

  // Load the selected job and check whether an application already exists.
  useEffect(() => {
    let active = true;

    const loadDetails = async () => {
      try {
        const [jobData, applications] = await Promise.all([
          fetchJobById(id),
          fetchApplications()
        ]);
        if (!active) return;
        setJob(jobData);
        setApplied(applications.some((application) => Number(application.jobId) === Number(id)));
      } catch (err) {
        if (active) setError(err.response?.data?.message || "Unable to load this job. Check the backend server.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDetails();
    return () => { active = false; };
  }, [id]);

  const handleApply = async () => {
    if (!job || applied || applying) return;
    setApplying(true);
    setError("");
    try {
      await createApplication(job.id);
      setApplied(true);
    } catch (err) {
      if (err.response?.status === 409) {
        setApplied(true);
        setError("You have already applied to this job.");
      } else {
        setError(err.response?.data?.message || "Unable to submit your application.");
      }
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <main className="job-details-page"><p>Loading job details...</p></main>;

  if (!job) {
    return <div className="job-not-found"><h2>Job Not Found</h2><p>{error}</p><Link to="/">Back to Jobs</Link></div>;
  }

  return (
    <main className="job-details-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back to Jobs</button>
      <div className="job-details-container">
        <section className="job-details-main">
          <div className="details-company">
            <div className="company-logo large-logo" style={{ backgroundColor: job.color }}>{job.logo}</div>
            <div><h1>{job.title}</h1><p>{job.company}</p></div>
          </div>
          <div className="details-tags">
            <span>📍 {job.location}</span><span>💼 {job.type}</span><span>🎓 {job.experience}</span><span>💰 {job.salary}</span>
          </div>
          <hr />
          <section className="details-section"><h2>Job Description</h2><p>{job.description}</p></section>
          <section className="details-section">
            <h2>Job Information</h2>
            <p><strong>Company:</strong> {job.company}</p>
            <p><strong>Location:</strong> {job.location}</p>
            <p><strong>Experience:</strong> {job.experience}</p>
            <p><strong>Employment Type:</strong> {job.type}</p>
            <p><strong>Salary:</strong> {job.salary}</p>
            <p><strong>Posted:</strong> {job.posted}</p>
          </section>
        </section>
        <aside className="apply-sidebar">
          <h2>Interested in this role?</h2>
          <p>Submit your application and track your progress through CareerNest.</p>
          <h3>{job.salary}</h3>
          <button className="apply-btn" onClick={handleApply} disabled={applied || applying}>
            {applying ? "Submitting..." : applied ? "✓ Application Submitted" : "Apply Now"}
          </button>
          {error && <p className="profile-error" role="alert">{error}</p>}
          {applied && <p className="success-message">Your application has been saved successfully!</p>}
          <Link to="/applications" className="track-link">Track My Applications →</Link>
        </aside>
      </div>
    </main>
  );
}

export default JobDetails;
